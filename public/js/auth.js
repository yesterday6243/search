// Login / register / logout and loading the signed-in user's state.
// Classic script sharing the page's global scope; load order is defined in index.html.

function createGuestPayload() {
  return {
    state: structuredClone(GUEST_STATE),
    updatedAt: new Date().toISOString(),
  };
}

function applyGuestState() {
  lastRenderedSyncKey = "";
  const payload = createGuestPayload();
  applyState(payload, { persistLocalCache: false });
}

function updateAuthMeta() {
  if (!authMeta) {
    return;
  }
  authMeta.textContent = "";
  authMeta.classList.add("hidden");
}

function setAuthMessage(message = "", tone = "error") {
  if (!authMessage) {
    return;
  }
  if (!message) {
    authMessage.textContent = "";
    authMessage.classList.add("hidden");
    authMessage.dataset.tone = "";
    return;
  }
  authMessage.textContent = message;
  authMessage.classList.remove("hidden");
  authMessage.dataset.tone = tone;
}

function switchAuthMode(mode) {
  authMode = mode === AUTH_MODE_REGISTER ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN;
  authTabLogin.classList.toggle("is-active", authMode === AUTH_MODE_LOGIN);
  authTabRegister.classList.toggle("is-active", authMode === AUTH_MODE_REGISTER);
  loginForm.classList.toggle("hidden", authMode !== AUTH_MODE_LOGIN);
  registerForm.classList.toggle("hidden", authMode !== AUTH_MODE_REGISTER);
  authTitle.textContent = authMode === AUTH_MODE_REGISTER ? "注册账号" : "登录账号";

  const registerBlocked = !authState.canRegister && authMode === AUTH_MODE_REGISTER;
  registerSubmitButton.disabled = registerBlocked;
  if (registerBlocked) {
    setAuthMessage("注册人数已达上限（50），请使用已有账号登录。", "error");
  } else if (!authMessage.classList.contains("hidden")) {
    setAuthMessage("");
  }
}

function openAuthModal(preferredMode = AUTH_MODE_LOGIN) {
  updateAuthMeta();
  setAuthMessage("");
  switchAuthMode(preferredMode);
  authModal.classList.remove("hidden");
  authModal.setAttribute("aria-hidden", "false");
  syncOverlayVisibility();

  if (authMode === AUTH_MODE_REGISTER) {
    registerUsernameInput.focus();
  } else {
    loginUsernameInput.focus();
  }
}

function closeAuthModal() {
  authModal.classList.add("hidden");
  authModal.setAttribute("aria-hidden", "true");
  setAuthMessage("");
  syncOverlayVisibility();
}

async function refreshAuthStatus() {
  try {
    const payload = await fetchJson("/api/auth/status");
    authState = {
      loggedIn: Boolean(payload.loggedIn),
      username: payload.username || "",
      userCount: Number(payload.userCount) || 0,
      userLimit: Number(payload.userLimit) || USER_LIMIT,
      canRegister: Boolean(payload.canRegister),
    };
  } catch (error) {
    console.error(error);
    authState = {
      loggedIn: false,
      username: "",
      userCount: 0,
      userLimit: USER_LIMIT,
      canRegister: true,
    };
  }
  updateAuthMeta();
}

async function handleOpenSettingsClick() {
  if (authState.loggedIn) {
    openSettings();
    return;
  }
  pendingOpenSettingsAfterAuth = true;
  const mode = authState.userCount === 0 ? AUTH_MODE_REGISTER : AUTH_MODE_LOGIN;
  openAuthModal(mode);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;

  if (!username || !password) {
    setAuthMessage("请输入账号和密码");
    return;
  }

  try {
    await fetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    await refreshAuthStatus();
    await startUserSync();
    closeAuthModal();
    renderSyncStatus();
    showNotice(`欢迎回来，${authState.username}`, "success");
    if (pendingOpenSettingsAfterAuth) {
      pendingOpenSettingsAfterAuth = false;
      openSettings();
    }
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "登录失败，请稍后重试");
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const username = registerUsernameInput.value.trim();
  const password = registerPasswordInput.value;
  const confirm = registerPasswordConfirmInput.value;

  if (!authState.canRegister) {
    setAuthMessage("注册人数已达上限（50），请使用已有账号登录。");
    switchAuthMode(AUTH_MODE_LOGIN);
    return;
  }

  if (!username) {
    setAuthMessage("请输入账号");
    return;
  }
  if (password.length < 8) {
    setAuthMessage("密码至少 8 位");
    return;
  }
  if (password !== confirm) {
    setAuthMessage("两次输入的密码不一致");
    return;
  }

  try {
    await fetchJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    await refreshAuthStatus();
    await startUserSync();
    closeAuthModal();
    renderSyncStatus();
    showNotice(`注册成功，欢迎 ${authState.username}`, "success");
    if (pendingOpenSettingsAfterAuth) {
      pendingOpenSettingsAfterAuth = false;
      openSettings();
    }
  } catch (error) {
    console.error(error);
    setAuthMessage(error.message || "注册失败，请稍后重试");
    if (error?.status === 409 && error?.payload?.code === "USER_LIMIT_REACHED") {
      await refreshAuthStatus();
      switchAuthMode(AUTH_MODE_LOGIN);
    }
  }
}

async function handleLogout() {
  const confirmed = await openConfirmDialog({
    title: "退出登录",
    message: "退出后会保留当前浏览器里的本地数据，但需要重新登录才能访问云端备份。",
    confirmText: "退出登录",
    scopeElement: settingsDrawer,
  });
  if (!confirmed) {
    return;
  }

  await pushSync().catch(() => {});
  clearSyncStore();
  try {
    await fetchJson("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }

  await refreshAuthStatus();
  closeSettings();
  closeSyncModal();
  clearPersistedStateSnapshot();
  applyGuestState();
  renderSyncStatus();
  showNotice("已退出登录", "success");
}
