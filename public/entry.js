const captchaImage = document.querySelector('.captcha-image');

// CAPTCHA画像表示
fetch('/captcha_image')
  .then((response) => {
    return response.text();
  })
  .then((svg) => {
    captchaImage.innerHTML = svg;
  })
  .catch((err) => {
    console.error(err);
    alert('認証用画像を取得できません。');
  });
