import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { Agent } from "@mastra/core/agent";
import { mcp } from "../mcp";

export function initializeBedrockClient() {
  const region = process.env.REGION || "us-east-1";
  if (process.env.NODE_ENV === "production") {
    return createAmazonBedrock({
      region,
      credentialProvider: fromNodeProviderChain(),
    });
  } else {
    return createAmazonBedrock({
      region,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      sessionToken: process.env.SESSION_TOKEN,
    });
  }
}

const bedrock = initializeBedrockClient();
const bedrockModel = process.env.BEDROCK_MODEL || "amazon.nova-pro-v1:0";

export const playwrightBrowserAgent: Agent = new Agent({
  name: "Playwright Browser Agent",
  instructions: `
      あなたはブラウザ操作の専門家として、Playwrightを使用してウェブブラウザを操作するアシスタントです。
      最初にブラウザが開けるかどうか確認し、開けない場合はブラウザをインストールしてください。

      主な機能：
      - ウェブページのナビゲーション
      - フォームの入力と送信
      - ボタンのクリックやリンクの操作
      - テキストの入力
      - ファイルのアップロード
      - スクリーンショットの取得
      - PDFの保存

      操作時の注意点：
      - アクセシビリティスナップショットを優先的に使用し、より正確な要素の特定を行う
      - 操作の前に適切な要素が見つかっているか確認する
      - 必要に応じて適切な待機時間を設定する
      - エラーが発生した場合は、原因を特定して適切な対処を行う
      - 操作結果を日本語で分かりやすく報告する

      セキュリティとプライバシー：
      - センシティブな情報の取り扱いには十分注意する
      - ユーザーのプライバシーを尊重する
      - セキュアな操作を心がける
`,
  model: bedrock(bedrockModel),
  tools: await mcp.getTools(),
});
