// Shared overlay, confirm dialog and toast notices.
// Classic script sharing the page's global scope; load order is defined in index.html.

function syncOverlayVisibility() {
  const hasOverlay =
    !settingsDrawer.classList.contains("hidden") ||
    !authModal.classList.contains("hidden") ||
    !syncModal.classList.contains("hidden") ||
    !confirmModal.classList.contains("hidden") ||
    Boolean(quickAddModal && !quickAddModal.classList.contains("hidden"));
  drawerScrim.classList.toggle("hidden", !hasOverlay);
  document.body.classList.toggle("drawer-open", hasOverlay);
}

function openConfirmDialog({
  title = "请确认操作",
  message = "确认后会继续执行当前操作。",
  confirmText = "确定",
  cancelText = "取消",
  scopeElement = null,
  inputValue = null,
  inputLabel = "名称",
  inputPlaceholder = "",
  tone = "default",
} = {}) {
  if (!confirmModal || !confirmModalTitle || !confirmModalMessage) {
    return Promise.resolve(false);
  }
  if (confirmResolver) {
    confirmResolver(false);
    confirmResolver = null;
  }

  confirmModalTitle.textContent = title;
  confirmModalMessage.textContent = message;
  if (confirmModalConfirmButton) {
    confirmModalConfirmButton.textContent = confirmText;
    confirmModalConfirmButton.classList.toggle("is-danger", tone === "danger");
  }
  if (confirmModalCancelButton) {
    confirmModalCancelButton.textContent = cancelText;
  }
  const useInput = inputValue !== null;
  if (confirmModalInputField && confirmModalInput && confirmModalInputLabel) {
    confirmModalInputField.classList.toggle("hidden", !useInput);
    confirmModalInputLabel.textContent = inputLabel || "名称";
    confirmModalInput.placeholder = inputPlaceholder || "";
    confirmModalInput.value = useInput ? String(inputValue) : "";
  }
  if (confirmScopeElement instanceof Element) {
    confirmScopeElement.classList.remove("has-local-confirm");
  }
  confirmScopeElement = scopeElement instanceof Element ? scopeElement : null;
  confirmScopeElement?.classList.add("has-local-confirm");

  confirmModal.classList.remove("hidden");
  confirmModal.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();
  if (useInput && confirmModalInput) {
    confirmModalInput.focus();
    confirmModalInput.select();
  } else {
    confirmModalConfirmButton?.focus();
  }

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirmDialog(result) {
  if (!confirmModal) {
    return;
  }
  confirmModal.classList.add("hidden");
  confirmModal.setAttribute("aria-hidden", "true");
  if (confirmScopeElement instanceof Element) {
    confirmScopeElement.classList.remove("has-local-confirm");
  }
  confirmScopeElement = null;
  syncOverlayVisibility();
  const resolver = confirmResolver;
  confirmResolver = null;
  if (resolver) {
    if (!confirmModalInputField?.classList.contains("hidden") && confirmModalInput) {
      resolver({
        confirmed: Boolean(result),
        value: confirmModalInput.value.trim(),
      });
      return;
    }
    resolver(Boolean(result));
  }
}

function showNotice(message, tone = "default") {
  if (!noticeToast || !message) {
    return;
  }
  if (noticeTimer) {
    window.clearTimeout(noticeTimer);
    noticeTimer = 0;
  }
  noticeToast.textContent = message;
  noticeToast.dataset.tone = tone;
  noticeToast.classList.remove("hidden");
  noticeTimer = window.setTimeout(() => {
    noticeToast.classList.add("hidden");
    noticeToast.dataset.tone = "";
    noticeTimer = 0;
  }, NOTICE_HIDE_DELAY_MS);
}
