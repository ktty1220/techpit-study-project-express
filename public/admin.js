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
