const captchaImage = document.querySelector('.captcha-image');

// CAPTCHA画像表示
fetch('/captcha_image')
  .then(function (response) {
    return response.text();
  })
  .then(function (svg) {
    captchaImage.innerHTML = svg;
  })
  .catch(function (err) {
    console.error(err);
    alert('認証用画像を取得できません。');
  });
