import { ComponentType, Component } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import configStore from './index'

const store = configStore()

export function withRedux<T>(WrappedComponent: ComponentType<T>) {
  return class extends Component<T> {
    render() {
      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={store.__PERSISTOR}>
            <WrappedComponent {...this.props} />
          </PersistGate>
        </Provider>
      )
    }
  }
}
