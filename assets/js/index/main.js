import ReactDOM from 'react-dom';
import React from 'react';
import App from "./app";

window.appEntryCreator('index', (users) => {
  ReactDOM.render(<App users={users}/>, document.getElementById('app'));
});


