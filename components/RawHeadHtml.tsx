interface RawHeadHtmlProps {
  html: string;
}

export default function RawHeadHtml({ html }: RawHeadHtmlProps) {
  if (!html) return null;

  // Return raw HTML that gets injected directly into <head> without wrapper elements
  return <>{html}</>;
}
