import React from 'react';
import TelaErro from './TelaErro';

export default class ErroBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reiniciar = this.reiniciar.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log('ErroBoundary capturou um erro:', error, info?.componentStack);
  }

  reiniciar() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <TelaErro
          title="Algo deu errado"
          message="Ocorreu um erro inesperado nesta tela. Tente novamente."
          onRetry={this.reiniciar}
          retryLabel="Tentar novamente"
        />
      );
    }

    return this.props.children;
  }
}