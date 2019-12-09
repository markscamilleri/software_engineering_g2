// Global.js
import React, { useReducer } from 'react'
const initialState = {radius: 500, limit: 100}
const CounterContext = React.createContext(initialState);

const UpdateRadius = "ADD";

let reducer = (state, action) => {
  switch (action.type) {
    case UpdateRadius:
      return { ...state, radius: action.payload.radius };
    default:
      return;
  }
};



function CounterProvider(props) {
	
 const [state, dispatch] = useReducer(reducer, initialState);
 
 return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {props.children}
    </CounterContext.Provider>
  );
}

function updateRadius(radi) {
  return {
    type: UpdateRadius,
    payload: {
      radius: radi
    }
  };
}

export { CounterContext, CounterProvider, updateRadius };