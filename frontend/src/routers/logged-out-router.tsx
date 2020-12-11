import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { CreatAccount } from "../pages/create-account"
import { Login } from "../pages/login"

export const LoggedOutRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/create-account">
          <CreatAccount />
        </Route>
        <Route path="/">
          <Login />
        </Route>
      </Switch>
    </Router>
  )
}
