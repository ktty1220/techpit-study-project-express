// 記事削除
const deleteLinks = document.querySelectorAll('[data-delete]');
const deleteForm = document.querySelector('form[name=delete]');
const deleteTarget = deleteForm.querySelector('input[name=date]');

deleteLinks.forEach((link) => {
  link.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (confirm('記事を削除します。よろしいですか？')) {
      deleteTarget.value = ev.currentTarget.dataset.delete;
      deleteForm.submit();
    }
  });
});

// パスワード変更
const passwordButton = document.querySelector('input[name=change_password]');
const password = document.querySelector('input[name=password]');
const passwordVerify = document.querySelector('input[name=password_verify]');

passwordButton.addEventListener('click', (ev) => {
  const fetchPromise = fetch('/admin/change_password', {
    method: 'POST',
    body: 'password=' + password.value + '&password_verify=' + passwordVerify.value,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  fetchPromise
    .then((response) => {
      return response.text();
    })
    .then((message) => {
      alert(message);
    })
    .catch((err) => {
      console.error(err);
      alert('パスワードの変更ができませんでした。');
    });
});
