import React, { Component } from 'react';

class Suspense extends Component {
  static defaultProps = {
    delayMs: 300,
    fallback: <div>Loading</div>,
    getDerivedStateFromRejection: () => null
  };

  state = {
    state: this.props.initialState || null,
    showFallback: false,
    latestPromise: null
  };

  setFallbackTimer = () =>
    (this.fallbackTimer = setTimeout(
      () =>
        this.setState({
          showFallback: true
        }),
      this.props.delayMs
    ));
  resetFallbackTimer = () => clearTimeout(this.fallbackTimer);

  setNextState = state =>
    this.setState({
      state,
      showFallback: false
    });

  updateState = nextState => {
    // Always reset current timer
    this.resetFallbackTimer();

    // Make sure we always have a promise
    const statePromise = Promise.resolve(nextState);

    return new Promise(resolve =>
      this.setState(
        {
          latestPromise: statePromise
        },
        resolve
      )
    )
      .then(() => {
        // Set timer to show fallback if promise takes longer than delayMs
        this.setFallbackTimer();

        return statePromise;
      })
      .then(
        state => {
          // Only update state from the latest triggered promise
          if (statePromise === this.state.latestPromise) {
            this.resetFallbackTimer();
            this.setNextState(state);
          }
        },
        rejection => {
          // Only catch rejections from the latest triggered promise
          if (statePromise === this.state.latestPromise) {
            this.resetFallbackTimer();
            this.setNextState(
              this.props.getDerivedStateFromRejection(
                rejection,
                this.state.state
              )
            );
          }
        }
      );
  };

  componentWillUnmount() {
    this.resetFallbackTimer();
  }

  render() {
    const { showFallback, state } = this.state;
    const { fallback, render } = this.props;

    if (showFallback) {
      return fallback;
    } else {
      return render({ state, updateState: this.updateState });
    }
  }
}

export default Suspense;
