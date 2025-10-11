interface RawBodyHtmlProps {
  html: string;
}

export default function RawBodyHtml({ html }: RawBodyHtmlProps) {
  if (!html) return null;

  // Return raw HTML that gets injected directly into <body> without wrapper elements
  return <>{html}</>;
}
