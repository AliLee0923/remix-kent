import type {Loader, Action} from '@remix-run/data'
import {json, redirect} from '@remix-run/data'
import {Form, useRouteData} from '@remix-run/react'
import * as React from 'react'
import {Outlet} from 'react-router'
import {requireCustomer, rootStorage} from '../utils/session.server'

export const loader: Loader = ({request}) => {
  return requireCustomer(request)(customer => {
    return json(customer)
  })
}

export const action: Action = async ({request}) => {
  const session = await rootStorage.getSession(request.headers.get('Cookie'))
  const cookie = await rootStorage.destroySession(session)

  return redirect('/', {headers: {'Set-Cookie': cookie}})
}

function YouScreen() {
  const data = useRouteData()
  return (
    <div>
      <h1>User: {data.sessionUser.email}</h1>
      <div>Team: {data.user.team}</div>
      <div>
        <Form method="post" action="/me">
          <button type="submit">Logout</button>
        </Form>
      </div>
      <Outlet />
    </div>
  )
}

export default YouScreen
