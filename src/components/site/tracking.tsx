import Script from "next/script";
import type { SiteSettings } from "@/lib/settings";

/**
 * Injects CMS-configured tracking & custom code.
 * Everything here is controlled from Admin → Integrations — no source edits needed.
 */
export function TrackingHead({ s }: { s: SiteSettings }) {
  return (
    <>
      {/* Google Search Console verification */}
      {s.gscVerification && (
        <meta name="google-site-verification" content={s.gscVerification} />
      )}

      {/* Google Tag Manager */}
      {s.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtmId}');`}
        </Script>
      )}

      {/* GA4 */}
      {s.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga4Id}');`}
          </Script>
        </>
      )}

      {/* Microsoft Clarity */}
      {s.clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${s.clarityId}");`}
        </Script>
      )}

      {/* Meta Pixel */}
      {s.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {/* Custom head code from CMS */}
      {s.customHeadCode && (
        <div dangerouslySetInnerHTML={{ __html: s.customHeadCode }} />
      )}
    </>
  );
}

export function TrackingBodyStart({ s }: { s: SiteSettings }) {
  return (
    <>
      {/* GTM noscript fallback */}
      {s.gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${s.gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      )}
      {s.customBodyStartCode && (
        <div dangerouslySetInnerHTML={{ __html: s.customBodyStartCode }} />
      )}
    </>
  );
}

export function TrackingBodyEnd({ s }: { s: SiteSettings }) {
  if (!s.customBodyEndCode && !s.customGlobalJs && !s.customGlobalCss) return null;
  return (
    <>
      {s.customBodyEndCode && (
        <div dangerouslySetInnerHTML={{ __html: s.customBodyEndCode }} />
      )}
      {s.customGlobalCss && <style dangerouslySetInnerHTML={{ __html: s.customGlobalCss }} />}
      {s.customGlobalJs && (
        <Script id="custom-global-js" strategy="afterInteractive">
          {s.customGlobalJs}
        </Script>
      )}
    </>
  );
}
