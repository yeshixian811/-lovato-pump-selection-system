import { Component } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configStore from './store'

import './app.scss'

const store = configStore()

class App extends Component {
  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  render () {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={store.__PERSISTOR}>
          {this.props.children}
        </PersistGate>
      </Provider>
    )
  }
}

export default App
