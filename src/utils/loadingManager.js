let startLoading = () => {};
let stopLoading = () => {};

export const setLoadingHandlers = (startFn, stopFn) => {
  startLoading = startFn;
  stopLoading = stopFn;
};

export const loadingManager = {
  start: () => startLoading(),
  stop: () => stopLoading(),
};
