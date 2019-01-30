import '../../scss/common/styles.scss';

window.appEntry = window.appEntry || {};

window.appEntryCreator = function (entry, creator) {
  window.appEntry[entry] = creator;
  return creator;
};