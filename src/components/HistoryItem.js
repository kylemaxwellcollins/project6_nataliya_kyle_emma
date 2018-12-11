import React, { Component } from "react";
import { withRouter } from "react-router-dom";
class HistoryItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { workout, workoutKey } = this.props;

    return (
      <button id={workoutKey} onClick="" className="historyItem">
        <p>{workout.date}</p>
        <p>{workout.routineName}</p>
        <p>{workout.workoutName}</p>
        <p>{workout.notes}</p>
            <i class="fas fa-angle-right" />
      </button>
    );
  }
}

export default withRouter(HistoryItem);
