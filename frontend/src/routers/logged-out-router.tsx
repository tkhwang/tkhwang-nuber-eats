import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { CreatAccount } from "../pages/create-account"

export const LoggedOutRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="create-account">
          <CreatAccount />
        </Route>
        <Route path="/"></Route>
      </Switch>
    </Router>
  )
}
