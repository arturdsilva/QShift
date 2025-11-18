let _setPage = null;

export const registerNavigation = (setPageFn) => {
  _setPage = setPageFn;
};

export const logout = () => {
  localStorage.removeItem("access_token");

  if (_setPage) {
    _setPage(0);
  }
};