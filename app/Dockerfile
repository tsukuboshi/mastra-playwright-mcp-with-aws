# ベースイメージとしてNode.jsを使用
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードをコピー
COPY . .

# ポートの公開
EXPOSE 4111

# アプリケーションの起動
CMD ["npm", "run", "dev"]
