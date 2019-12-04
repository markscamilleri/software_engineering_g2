import React from 'react'

export const StoreContext = React.createContext({rad: 500, lim: 100});

export default ({ children }) => {

  const Details = React.createContext({rad: 500, lim: 100});
  const [radius, setRadius] = React.useState(500)
  const [limit, setLimit] = React.useState(100)

  const store = {
    radius: [radius, setRadius],
    limit: [limit, setLimit],
  }

  return (
  <StoreContext.Provider value={store}>
    <Details.Provider>
        {children}
    </Details.Provider>
  </StoreContext.Provider>
  )
}