/* eslint-disable no-empty */
export const getItem = (key) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState == null) {
      return undefined;
    }
    return serializedState;
  } catch (err) {
    return undefined;
  }
};

export const saveItem = (state, key) => {
  try {
    localStorage.setItem(key, state);
  } catch (err) {}
};

export const deleteItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};
