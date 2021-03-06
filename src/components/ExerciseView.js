import React, { Component } from "react";
import ExerciseViewForm from "./ExerciseViewForm";
import date from "./date";
import { withRouter } from "react-router-dom";
import firebase from "./firebase";

class ExerciseView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completedWorkout: {
        routineName: "",
        workoutName: "",
        date: "",
        exercises: {}
      }
    };
  }

  componentDidMount() {
    const { userData } = this.props;
    if (userData) {
      let updatedWorkout = Object.assign(
        {},
        this.state.completedWorkout.exercises
      );
      const setObj = {
        weight: "",
        reps: ""
      };

      this.exerciseArray.forEach(exercise => {
        let exerciseName = exercise[1].exerciseName;
        updatedWorkout[exerciseName] = [];
        for (let i = 0; i < exercise[1].exerciseSets; i++) {
          updatedWorkout[exerciseName].push(setObj);
        }
      });
      this.setState({
        completedWorkout: {
          exercises: updatedWorkout
        }
      });
    }
  }

  exerciseUpdate = (e, exerciseName, index) => {
    let updatedWorkout = JSON.stringify(this.state.completedWorkout.exercises);
    let updatedWorkoutParsed = JSON.parse(updatedWorkout);

    updatedWorkoutParsed[exerciseName][index][e.target.id] = e.target.value;

    this.setState({
      completedWorkout: {
        exercises: updatedWorkoutParsed
      }
    });
  };

  // FINISH WORKOUT

  finishWorkout = e => {
    const { userData } = this.props;
    const routineKey = this.props.match.params.routineKey;
    const workoutKey = this.props.match.params.workoutKey;
    e.preventDefault();
    this.setState(
      {
        completedWorkout: {
          ...this.state.completedWorkout,
          date: date,
          routineName: userData.routines[routineKey].routineName,
          workoutName:
            userData.routines[routineKey].workouts[workoutKey].workoutName
        }
      },
      () => {
        const completedWorkoutKey = firebase
          .database()
          .ref(`/users/${this.props.uid}/completedWorkouts/`)
          .push(this.state.completedWorkout).key;

        // re-direct
        this.props.history.push(
          `/addnotes/${routineKey}/${workoutKey}/${completedWorkoutKey}`
        );
      }
    );
  };

  render() {
    
    const { userData, goBack } = this.props;

    if (userData) {
      const routineKey = this.props.match.params.routineKey;
      const workoutKey = this.props.match.params.workoutKey;

      this.exerciseArray = Object.entries(
        userData.routines[routineKey].workouts[workoutKey].exercises
      );

      this.printExerciseViewForms = (sets, reps, name) => {
        this.exerciseViewForms = [];
        for (let i = 0; i < sets; i++) {
          this.exerciseViewForms.push(
            <ExerciseViewForm
              exerciseName={name}
              exerciseUpdate={this.exerciseUpdate}
              exerciseReps={reps}
              index={i}
            />
          );
        }
      };

      this.exerciseMap = () => {
        return this.exerciseArray.map(exercise => {
          return (
            <div key={exercise[0]} className="exerciseCard clearfix">
              <h2>{exercise[1].exerciseName}</h2>

              {/* <h3>Weight</h3> */}
              {/* <h3>Reps</h3> */}
              {/* <h3>Done</h3> */}

              {this.printExerciseViewForms(
                exercise[1].exerciseSets,
                exercise[1].exerciseReps,
                exercise[1].exerciseName
              )}

              {this.exerciseViewForms}
            </div>
          );
        });
      };
    }

    return (
      <section className="exerciseView">
        <div className="wrapper">
          <button className="btn--goBack" onClick={goBack}>
            <i class="fas fa-long-arrow-alt-left" />
            Go Back
          </button>
          <form action="" onSubmit={this.finishWorkout}>
            {userData && this.exerciseMap()}

            <input className="btn--save" type="submit" value="Finish Workout" />
          </form>
          
        </div>
      </section>
    );
  }
}

export default withRouter(ExerciseView);
