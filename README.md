# Techpit「実務を意識したJavaScriptのWEBシステム開発体験を通して知識と考え方を身に付けよう！」教材プロジェクト

本リポジトリは[Techpit](https://www.techpit.jp/)にて公開中の教材「実務を意識したJavaScriptのWEBシステム開発体験を通して知識と考え方を身に付けよう！」で使用するプロジェクトです。

## リポジトリ構成

- `start`タグが付与されているコミットが本教材開始時の初期状態です。本教材はこの初期状態のプロジェクトを修正・機能追加していく流れで進めていき、全カリキュラム終了時には最新コミットの状態になります。
- 学習者の方は、まず<https://github.com/ktty1220/techpit-study-project-express/releases/tag/start>から初期状態のプロジェクトをダウンロードしてローカル環境に展開してください。
- コミットメッセージはカリキュラムの各パート終了時の状態と紐付いています(例：`3-3` => 3章の3パート終了時の状態)。

## 実行用の準備

- 本プロジェクトを`clone`するか、ダウンロードして展開したフォルダで以下のコマンドを実行し、必要なパッケージをインストールします。

```sh
$ npm install
```

その後、以下のコマンドを実行するとHTTPサーバーが起動します。

```sh
$ npm start
```

HTTPサーバーが正常に起動すると以下のようなメッセージが表示されます。

```sh
Listening on http://127.0.0.1:15864/
```

WEBブラウザのアドレスバーに`http://127.0.0.1:15864/blog`と入力して`Enter`キーを押すと、稼働したHTTPサーバーにアクセスすることができます。

## ライセンス等

- サンプルブログ記事は[青空文庫](https://www.aozora.gr.jp/)に掲載されている作品から引用したものです。
- サンプル画像は[Photos Public Domain](https://www.photos-public-domain.com/)で公開されているCC0(著作権フリー)のものです。
- 本リポジトリは[MIT license](http://www.opensource.org/licenses/mit-license)となります。

&copy; 2020 [ktty1220](mailto:ktty1220@gmail.com)
