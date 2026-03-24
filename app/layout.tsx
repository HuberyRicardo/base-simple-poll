import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://base-simple-poll.vercel.app"),
  title: "BaseSimplePoll - On-chain Voting",
  description: "创建单轮投票，任何人可免费（仅 gas）投票一次。投票公开计数并在投票结束后可查看赢家。",
  openGraph: {
    title: "BaseSimplePoll - On-chain Voting",
    description: "创建单轮投票，任何人可免费（仅 gas）投票一次。投票公开计数并在投票结束后可查看赢家。",
    url: "https://base-simple-poll.vercel.app",
    siteName: "BaseSimplePoll",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseSimplePoll - On-chain Voting",
    description: "创建单轮投票，任何人可免费（仅 gas）投票一次。投票公开计数并在投票结束后可查看赢家。",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="69c249c83c2c56b9bbd2f622" />
        <meta name="talentapp:project_verification" content="e82d61f8afe6d3796d3dbae7495e04d57ce869bffa5da6f239a96556bab3c822a22620f84869cdc2e0a9bcd9a6cc4bc0455ec3aeacba2cf06dadfda5f7186fbf" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
