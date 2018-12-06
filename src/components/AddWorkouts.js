import React, { Component } from "react";
import { Link } from "react-router-dom";
import firebase from "./firebase";

class AddWorkouts extends Component {
  render() {
    return (
      <section className="addWorkouts">
        <h2>Workouts</h2>
        <form action="" onSubmit={this.props.test}>
          {/* <form action="" onSubmit={this.props.handleSubmit}> */}
          <label htmlFor="routineName">Routine Name</label>
          <input
            onChange={this.props.handleChangeRoutine}
            type="text"
            name="routineName"
            id="routineName"
          />
          <input type="submit" value="Add Workout" />
        </form>
      </section>
    );
  }
}

export default AddWorkouts;
