import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import ReactDOM from 'react-dom';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TailwindPreviewProps {
  /**
   * Space-separated Tailwind class string applied to each direct child.
   * Only first-level children receive the classes — grandchildren are untouched.
   *
   * Styles are generated on-the-fly using the Tailwind Play CDN inside a hidden
   * iframe. The generated CSS is then injected into an isolated Shadow DOM so it
   * cannot affect (or be affected by) anything else on the page. Your app does
   * NOT need Tailwind installed.
   */
  classes?: string;

  /** Content to preview. Each direct child gets the classes applied. */
  children?: React.ReactNode;

  /** MUI sx applied to the outer wrapper Box. */
  sx?: SxProps<Theme>;

  /** Extra className on the outer wrapper Box. */
  className?: string;

  /**
   * When true, wraps each direct child in a <div> before applying classes
   * instead of merging className onto the child element directly.
   */
  wrapChildren?: boolean;

  /** Shown when classes is empty/unset, instead of children. */
  emptyState?: React.ReactNode;

  /** Minimum height of the preview area in pixels. Default: 80. */
  minHeight?: number;
}

// ---------------------------------------------------------------------------
// IframeStyleBridge
// A hidden <iframe> that loads the Tailwind Play CDN script, renders an
// element with the target classes, waits for Tailwind to generate styles,
// then posts the CSS back to the parent via postMessage.
//
// Why an iframe rather than a <script>?
//   • <script> tags injected into a shadow root don't execute.
//   • An iframe gets its own JS context so the CDN script runs normally.
//   • sandbox="allow-scripts allow-same-origin" lets us read stylesheet rules
//     while still keeping the iframe from navigating the top frame.
// ---------------------------------------------------------------------------

interface BridgeMessage {
  type: 'tw-styles';
  bridgeId: string;
  css: string;
}

interface IframeStyleBridgeProps {
  classes: string;
  bridgeId: string;
  onStylesReady: (css: string) => void;
}

function buildIframeHtml(classes: string, bridgeId: string): string {
  // Escape the class string for safe HTML attribute insertion
  const safeClasses = classes
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>
(function() {
  var BRIDGE_ID = ${JSON.stringify(bridgeId)};

  function send(css) {
    window.parent.postMessage({ type: 'tw-styles', bridgeId: BRIDGE_ID, css: css }, '*');
  }

  function extractCSS() {
    var css = '';
    var sheets = Array.from(document.styleSheets);
    for (var i = 0; i < sheets.length; i++) {
      try {
        var rules = Array.from(sheets[i].cssRules || []);
        for (var j = 0; j < rules.length; j++) {
          css += rules[j].cssText + '\\n';
        }
      } catch (e) { /* cross-origin guard */ }
    }
    send(css);
  }

  // Poll until the Tailwind-injected <style id="tailwindcss"> is populated.
  // The CDN script adds this tag and populates it asynchronously.
  var attempts = 0;
  var MAX_ATTEMPTS = 50; // 5 seconds max

  function poll() {
    var el = document.getElementById('tailwindcss');
    if (el && el.textContent && el.textContent.length > 500) {
      // Give Tailwind one more tick to finish any in-flight updates
      setTimeout(extractCSS, 30);
    } else if (attempts < MAX_ATTEMPTS) {
      attempts++;
      setTimeout(poll, 100);
    } else {
      // Timeout — send whatever we have
      extractCSS();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(poll, 100); });
  } else {
    setTimeout(poll, 100);
  }
})();
<\/script>
</head>
<body>
<div class="${safeClasses}">x</div>
</body>
</html>`;
}

function IframeStyleBridge({ classes, bridgeId, onStylesReady }: IframeStyleBridgeProps) {
  const onReadyRef = useRef(onStylesReady);
  onReadyRef.current = onStylesReady;

  // Listen for the CSS message from our iframe
  useEffect(() => {
    function handler(e: MessageEvent) {
      const data = e.data as BridgeMessage;
      if (
        data &&
        typeof data === 'object' &&
        data.type === 'tw-styles' &&
        data.bridgeId === bridgeId &&
        typeof data.css === 'string'
      ) {
        onReadyRef.current(data.css);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [bridgeId]);

  return (
    <iframe
      // srcdoc re-renders the iframe document whenever the string changes (i.e. classes change)
      srcDoc={buildIframeHtml(classes, bridgeId)}
      title={`tailwind-bridge-${bridgeId}`}
      sandbox="allow-scripts allow-same-origin"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        border: 'none',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canReceiveClassName(el: React.ReactElement): boolean {
  return typeof el.type === 'string' || typeof el.type === 'function';
}

// ---------------------------------------------------------------------------
// TailwindPreview
// ---------------------------------------------------------------------------

export function TailwindPreview({
  classes = '',
  children,
  sx,
  className,
  wrapChildren = false,
  emptyState,
  minHeight = 80,
}: TailwindPreviewProps) {
  const trimmedClasses = classes.trim();
  const hasClasses = trimmedClasses.length > 0;

  // Stable per-instance ID so postMessage routing works when multiple
  // TailwindPreview instances are on the same page.
  const bridgeId = useRef(`twp-${Math.random().toString(36).slice(2, 9)}`).current;

  // CSS received from the iframe bridge
  const [isolatedCss, setIsolatedCss] = useState('');

  // Shadow DOM infrastructure
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const styleElRef = useRef<HTMLStyleElement | null>(null);
  const mountPointRef = useRef<HTMLDivElement | null>(null);
  const [shadowMounted, setShadowMounted] = useState(false);

  // ---- Set up Shadow DOM once on mount ------------------------------------
  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host || shadowRootRef.current) return;

    const shadow = host.attachShadow({ mode: 'open' });
    shadowRootRef.current = shadow;

    // Base styles: inherit font/color from outer page; don't leak Tailwind's
    // base reset (like margin: 0 on body) outside the shadow root.
    const baseStyle = document.createElement('style');
    baseStyle.textContent = `
      *, *::before, *::after {
        box-sizing: border-box;
      }
      :host {
        display: block;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        line-height: inherit;
      }
    `;
    shadow.appendChild(baseStyle);

    // This <style> element receives the Tailwind-generated CSS from the bridge.
    const twStyle = document.createElement('style');
    shadow.appendChild(twStyle);
    styleElRef.current = twStyle;

    // React portal target — "display: contents" so it doesn't add a layout box.
    const mountPoint = document.createElement('div');
    mountPoint.style.cssText = 'display: contents;';
    shadow.appendChild(mountPoint);
    mountPointRef.current = mountPoint;

    setShadowMounted(true);
  }, []);

  // ---- Push CSS into shadow root whenever bridge sends new styles ----------
  useEffect(() => {
    if (styleElRef.current) {
      styleElRef.current.textContent = isolatedCss;
    }
  }, [isolatedCss]);

  // ---- Clear styles when classes removed ----------------------------------
  useEffect(() => {
    if (!hasClasses) {
      setIsolatedCss('');
      if (styleElRef.current) styleElRef.current.textContent = '';
    }
  }, [hasClasses]);

  // ---- Build children with classes applied to direct descendants ----------
  const hasChildren = Children.count(children) > 0;
  const defaultChild = (
    <div style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
      Preview
    </div>
  );
  const childArray = hasChildren ? Children.toArray(children) : [defaultChild];

  const renderChildren = () => {
    if (!hasClasses && emptyState !== undefined) return emptyState;

    return childArray.map((child, idx) => {
      const key = isValidElement(child) ? (child.key ?? idx) : idx;

      if (!hasClasses) {
        return isValidElement(child) ? cloneElement(child, { key } as object) : child;
      }

      if (wrapChildren || !isValidElement(child)) {
        return (
          <div key={key} className={trimmedClasses}>
            {child}
          </div>
        );
      }

      if (canReceiveClassName(child as React.ReactElement)) {
        const existing =
          (child as React.ReactElement<{ className?: string }>).props.className ?? '';
        return cloneElement(child as React.ReactElement<{ className?: string }>, {
          key,
          className: [existing, trimmedClasses].filter(Boolean).join(' '),
        });
      }

      return (
        <div key={key} className={trimmedClasses}>
          {child}
        </div>
      );
    });
  };

  return (
    <Box
      className={className}
      sx={{ position: 'relative', minHeight, ...sx }}
    >
      {/* Hidden iframe — generates Tailwind CSS and posts it back to us */}
      {hasClasses && (
        <IframeStyleBridge
          classes={trimmedClasses}
          bridgeId={bridgeId}
          onStylesReady={setIsolatedCss}
        />
      )}

      {/*
        Shadow DOM host element.
        The shadow root is attached to this div in the useEffect above.
        All Tailwind styles live inside the shadow root, fully isolated.
      */}
      <div
        ref={shadowHostRef}
        style={{ display: 'block', minHeight }}
      />

      {/*
        Portal the styled children into the shadow root's mount point.
        This runs after shadowMounted is true (i.e., the shadow root exists).
      */}
      {shadowMounted && mountPointRef.current
        ? ReactDOM.createPortal(renderChildren(), mountPointRef.current)
        : null}
    </Box>
  );
}

export default TailwindPreview;
