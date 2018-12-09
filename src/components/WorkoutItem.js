import React, { Component } from "react";

class WorkoutItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        {
            <button key={this.props.workoutKey}>
              {this.props.workoutName}
            </button>
        }
      </div>
    );
  }
}

export default WorkoutItem;
