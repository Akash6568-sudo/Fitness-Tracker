const params = new URLSearchParams(window.location.search);

const userId = params.get("userId");

if (userId) {
    localStorage.setItem("userId", userId);
}

const savedUserId = localStorage.getItem("userId");


// =============================
// ADD WORKOUT
// =============================

const workoutForm = document.getElementById("workoutForm");

if (workoutForm) {

    workoutForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        if (!savedUserId) {

            alert("Please login first");

            window.location.href = "/login.html";

            return;
        }

        const workoutName =
            document.getElementById("workoutName").value.trim();

        const duration =
            document.getElementById("duration").value;

        const calories =
            document.getElementById("calories").value;


        if (!workoutName || !duration || !calories) {

            alert("Please complete all workout details");

            return;
        }


        try {

            const response = await fetch("/api/workouts", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    userId: savedUserId,

                    workoutName: workoutName,

                    duration: Number(duration),

                    calories: Number(calories)

                })

            });


            const data = await response.json();


            if (response.ok) {

                alert("Workout saved successfully!");

                window.location.href = "/history.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.log(error);

            alert("Could not connect to server");

        }

    });

}

// =============================
// LOAD WORKOUTS
// =============================

async function loadWorkouts() {

    if (!savedUserId) {
        return;
    }


    const response =
        await fetch(
            "/api/workouts?userId="
            + savedUserId
        );


    const workouts =
        await response.json();


    // =============================
    // ACTIVITY LIST
    // =============================

    const activityList =
        document.getElementById(
            "activityList"
        );


    if (activityList) {

        activityList.innerHTML = "";


        if (workouts.length === 0) {

            activityList.innerHTML =
                "<p>No workouts added yet.</p>";

        }


        workouts
            .slice()
            .reverse()
            .forEach(function (workout) {

                const activity =
                    document.createElement("div");


                activity.className =
                    "activity-card";


                activity.innerHTML = `

                    <h3>
                        ${workout.workoutName}
                    </h3>

                    <p>
                        Duration:
                        ${workout.duration} minutes
                    </p>

                    <p>
                        Calories:
                        ${workout.calories}
                    </p>

                `;


                activityList.appendChild(
                    activity
                );

            });

    }


    // =============================
    // CALCULATE PROGRESS
    // =============================

    let totalWorkouts =
        workouts.length;

    let totalDuration = 0;

    let totalCalories = 0;


    workouts.forEach(function (workout) {

        totalDuration +=
            Number(workout.duration || 0);

        totalCalories +=
            Number(workout.calories || 0);

    });


    // DASHBOARD

    const totalWorkoutsElement =
        document.getElementById(
            "totalWorkouts"
        );

    const totalDurationElement =
        document.getElementById(
            "totalDuration"
        );

    const totalCaloriesElement =
        document.getElementById(
            "totalCalories"
        );


    if (totalWorkoutsElement) {

        totalWorkoutsElement.textContent =
            totalWorkouts;

    }


    if (totalDurationElement) {

        totalDurationElement.textContent =
            totalDuration;

    }


    if (totalCaloriesElement) {

        totalCaloriesElement.textContent =
            totalCalories;

    }


    // PROGRESS PAGE

    const progressWorkouts =
        document.getElementById(
            "progressWorkouts"
        );


    if (progressWorkouts) {

        progressWorkouts.innerHTML = "";


        workouts
            .slice()
            .reverse()
            .forEach(function (workout) {

                const card =
                    document.createElement("div");


                card.className =
                    "dashboard-card";


                card.innerHTML = `

                    <h2>
                        ${workout.workoutName}
                    </h2>

                    

                    <p>
                        Duration:
                        ${workout.duration} minutes
                    </p>

                    <p>
                        Calories:
                        ${workout.calories}
                    </p>

                `;


                progressWorkouts.appendChild(
                    card
                );

            });

    }

}


loadWorkouts();