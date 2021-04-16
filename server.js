// Node.js内蔵のファイルパス関連モジュールを読み込み
const path = require('path');
// Expressサーバーパッケージを読み込み
const express = require('express');
// パスワードハッシュ化パッケージを読み込み
const bcrypt = require('bcryptjs');
// CAPTCHA作成パッケージを読み込み
const svgCaptcha = require('svg-captcha');
// 同じフォルダにあるfunctions.jsを読み込み
const func = require('./functions');

// Expressサーバー使用準備
const app = express();

// 静的ファイル配信設定(/style.cssなど)
app.use(express.static('public'));

// テンプレートエンジン設定
app.set('view engine', 'ejs');

// テンプレート内で使用する関数の登録
app.locals.convertDateFormat = func.convertDateFormat;

// POSTリクエストのパラメータを取得するための設定
app.use(express.urlencoded({ extended: true }));

// ブラウザから送信されてきたクッキーを取得するための設定
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// アップロードされたファイルを取得するための設定
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// セッション管理設定
const session = require('express-session');
const FileStore = require('session-file-store')(session);
app.use(
  session({
    secret: 'my secret',
    name: 'new_session',
    saveUninitialized: true,
    resave: false,
    cookie: {
      httpOnly: true
    },
    store: new FileStore({
      path: './sessions',
      ttl: 86400,
      reapInterval: 3600
    })
  })
);

// flashメッセージを使用するための設定
const flash = require('connect-flash');
app.use(flash());

// ルーティング設定
app.get('/blog/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries);

  // ページに応じた記事一覧に絞る(1ページ5件)
  const entriesPerPage = 5;
  const currentPage = parseInt(request.query.page || 1, 10);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayEntries = entries.slice(startIndex, endIndex);
  const lastPage = Math.ceil(entries.length / entriesPerPage);

  // テンプレートを使用して出力したHTMLをクライアントに送信
  response.render('blog', {
    entries: displayEntries,
    sideList,
    currentPage,
    lastPage
  });
});

app.get('/blog/:date', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries);

  // ブログ記事を取得してテンプレートに渡して出力したHTMLをクライアントに送信
  const { date } = request.params;
  const entry = func.fileNameToEntry(date + '.txt', false);
  const commentList = func.getCommentList(date);
  response.render('entry', {
    entry,
    commentList,
    sideList,
    message: request.flash('post_comment_error')[0],
    commentInput: request.flash('post_comment_input')[0]
  });
});

app.post('/blog/:date/post_comment', (request, response) => {
  const { date } = request.params;
  const { comment, captcha } = request.body;
  if (!comment) {
    request.flash('post_comment_error', 'コメントが未入力です。');
  } else if (!captcha || captcha !== request.session.captcha) {
    request.flash('post_comment_error', '画像認証文字が一致しませんでした。');
    request.flash('post_comment_input', comment);
  } else {
    func.saveComment(date, comment);
  }
  request.session.save(() => {
    response.redirect('/blog/' + date);
  });
});

app.get('/captcha_image', (request, response) => {
  const captcha = svgCaptcha.create();
  request.session.captcha = captcha.text;
  response.type('svg');
  response.send(captcha.data);
});

app.get('/login', (request, response) => {
  response.render('login', {
    message: request.flash('login_error')[0]
  });
});

app.post('/auth', (request, response) => {
  const hashed = func.loadPassword();
  if (hashed && bcrypt.compareSync(request.body.password, hashed)) {
    request.session.admin = true;
    request.session.save(() => {
      response.redirect('/admin/');
    });
  } else {
    request.flash('login_error', 'ログインできませんでした。');
    request.session.save(() => {
      response.redirect('/login');
    });
  }
});

app.get('/logout', (request, response) => {
  delete request.session.admin;
  request.session.save(() => {
    response.redirect('/login');
  });
});

app.use('/admin/', (request, response, next) => {
  // 管理者権限がなければログイン画面に戻す
  if (request.session.admin) {
    next();
  } else {
    response.redirect('/login');
  }
});

app.get('/admin/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);

  response.render('admin', {
    entries,
    hasTodaysEntry: files.indexOf(func.getDateString() + '.txt') !== -1,
    uploadError: request.flash('upload_error')[0]
  });
});

app.get('/admin/edit', (request, response) => {
  // 新規投稿の場合は記事投稿ページの内容はすべて空(dateは自動設定)
  let entry = {
    date: func.getDateString(),
    title: '',
    content: '',
    image: null
  };
  let pageTitle = '記事の新規投稿';
  let commentList = null;

  // dateパラメータありの場合は記事の編集なので該当の記事データを取得してセットする
  if (request.query.date) {
    entry = func.fileNameToEntry(request.query.date + '.txt', false);
    pageTitle = '記事の編集(' + func.convertDateFormat(entry.date) + ')';
    commentList = func.getCommentList(entry.date);
  }
  response.render('edit', {
    entry,
    pageTitle,
    commentList
  });
});

app.post('/admin/post_entry', (request, response) => {
  const { date, title, content, imgdel } = request.body;
  func.saveEntry(date, title, content, imgdel);

  // ファイルがアップロードされているかチェック
  if (!request.files) {
    response.redirect('/admin/');
    return;
  }

  // アップロードされたファイルが画像かチェック
  const { image } = request.files;
  if (!image.mimetype.startsWith('image/')) {
    request.flash('upload_error', 'アップロードされたファイルは画像ではないので保存しませんでした。');
    request.session.save(() => {
      response.redirect('/admin/');
    });
    return;
  }

  // 既存のアップロードファイルを削除
  func.deleteImage(date);

  // アップロードされたファイルを保存
  const saveDir = func.createImageDir(date);
  image.mv(path.join(saveDir, image.name), (err) => {
    if (err) {
      request.flash('upload_error', err.message);
    }
    request.session.save(() => {
      response.redirect('/admin/');
    });
  });
});

app.post('/admin/delete_entry', (request, response) => {
  func.deleteEntry(request.body.date);
  response.redirect('/admin/');
});

app.post('/admin/change_password', (request, response) => {
  const { password, password_verify } = request.body;
  if (password.length < 8) {
    response.send('パスワードは8文字以上にしてください。');
    return;
  }
  if (password !== password_verify) {
    response.send('確認用のパスワードが異なります。');
    return;
  }
  const hashed = bcrypt.hashSync(password);
  func.savePassword(hashed);
  response.send('パスワードを変更しました。');
});

app.post('/admin/delete_comment', (request, response) => {
  const { date, id } = request.body;
  func.deleteComment(date, id);
  response.redirect('/admin/edit?date=' + date);
});

// Expressサーバー起動
const server = app.listen(15864, () => {
  console.log('Listening on http://127.0.0.1:' + server.address().port + '/');
});

// Expressで処理される前の通信生データを表示
/*
server.on('connection', (socket) => {
  socket.on('data', (data) => {
    console.log(data.toString());
  });
});
*/
