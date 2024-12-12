import React, { useEffect, useState } from "react";
import webgazer from "../webgazer/webgazer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigation } from "../utils/navigation";
import { reauthenticatingFetch } from "../utils/api";
import { calcAccuracy } from "./accuracy.js";

var calibrationData = [];

const CalibrationPage = () => {
  const [clickCounts, setClickCounts] = useState(Array(24).fill(0));
  const [totalClicks, setTotalClicks] = useState(1);

  const [calibrationStatus, setCalibrationLive] = useState(false); // Make sure no more clicks are registered after all circles are filled
  const [skipCalibration, setCalibrationSkip] = useState(false); // Used to skip calibration if already existing
  const [performCalibration, setCalibration] = useState(false); // Used to start new calibration and launch webgazer

  const [isCalibrationGETLoading, setCalibrationGETLoading] = useState(true);
  const [isLoading, setWebgazerLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [accuracy, setAccuracy] = useState(0);
  const [calibrationDate, setCalibrationDate] = useState(formatDate(new Date(Date.now())));

  const [screenInfo, setScreenInfo] = useState({
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  });

  const { toReadingPage } = useNavigation();

  /* Temporary function to calculate date in format DD/MM/YY, this probably won't be needed if backend is sending timestamp as string */
  function formatDate(date)
  {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  }

  // TO DO:

  // Get screen dimensions
  // Get screen resolution - DONE
  // Send it with calibration data

  // Make webpage go full screen on calibration, then exit fullscreen after
  //  Alert when trying to exit fullscreen - make sure to pause webgazer so nothing is recorded

  useEffect(() => {

    // Scroll automatically to top of page
    window.scrollTo({ top: 0, behavior: "smooth" }); // Auto-scroll to the top with smooth animation

    // Disable scrolling
    document.body.style.overflow = 'hidden';

    // Cleanup to restore scrolling on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [performCalibration, isCalibrationGETLoading, skipCalibration]);

  const [gap, setGap] = useState(window.innerWidth / 10);

  /* Change gap between calibration points if window size changes */
  useEffect(() => {
    const handleResize = () => {
      setGap(window.innerWidth / 10); // Update the gap on resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  // Check if calibration data exists
  useEffect(() => {
      setCalibrationGETLoading(true);
      const getCalibrationDataDB = async () => {
        try {

          const responseMsg = await reauthenticatingFetch("GET",`http://localhost:8000/api/user/calibration-retrieval/`)
        
          if (responseMsg.error) // if the JSON response contains an error, this means that no calibration data is found in database
          {
            // perform calibration
            setCalibration(true);

            setCalibrationGETLoading(false);
          }
          else
          {
            var data = responseMsg.calibration_values;
            setAccuracy(responseMsg.accuracy);
            try
            {
              localStorage.setItem("calibration", JSON.stringify(responseMsg)); // store local copy of calibration data in localstorage, so no need to fetch from database in same session
              // console.log("Copied from DB to localstorage");
            }
            catch (error) 
            {
              console.error("Failed to save calibration data to localStorage:", error);
              localStorage.removeItem("calibration");
              console.log("Applying the calibration data directly to the WebGazer instance");
              webgazer.setRegressionData(data);
            }

            // skip calibration
            setCalibrationSkip(true);

            setCalibrationGETLoading(false);
          }
        } catch (error) {
          console.error("Error getting calibration data:", error);
          setCalibrationGETLoading(false);
        }
      };

      // Check localstorage
      if(localStorage.getItem("calibration"))
      {
        calibrationData = JSON.parse(localStorage.getItem("calibration"));
        // console.log("Found calibration data from localstorage: ", calibrationData);
        setAccuracy(calibrationData.accuracy);
        console.log(calibrationData.accuracy);
        setCalibrationGETLoading(false);
        setCalibrationSkip(true);
      }
      else // if nothing is found in localstorage, check database
      {
        getCalibrationDataDB(); 
      }
  }, []);


  // WebGazer initialization
  useEffect(() => {
    if(performCalibration == true)
    {
      setWebgazerLoading(true);
    const initializeWebGazer = async () => {
      try {
        
        const loadingInterval = setInterval(() => {
          setLoadingProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(loadingInterval);
            }
            return Math.min(prevProgress + 100, 100);
          });
        }, 250);


        webgazer.params.showVideo = false;
        webgazer.params.showGazeDot = true; // set false to remove gaze dot
        webgazer.params.showVideoPreview = false;
        webgazer.params.saveDataAcrossSessions = false;
        webgazer.params.showPredictionPoints = false;
        webgazer.setRegression("weightedRidge");

        // change moveTickSize, videoViewerWidth and videoViewerHeight for accuracy
        webgazer.params.videoViewerWidth = 1920;
        webgazer.params.videoViewerHeight = 1080;
        webgazer.params.moveTickSize = 25;
        webgazer.params.storingPoints = true; // Stop storing the prediction points

        webgazer.clearData();

        await webgazer.begin(true);

        setCalibration(false);
        setCalibrationLive(true);

      } catch (error) {
        console.error("Error initializing WebGazer:", error);
      }
    };

    initializeWebGazer();
    }
  }, [performCalibration]);

  const handleCalibrationClick = async(index) => {
    if (calibrationStatus) {
      var reset = false;

      const newClickCounts = [...clickCounts];
      if (newClickCounts[index] < 3) {
        newClickCounts[index] += 1;
        setClickCounts(newClickCounts);
        setTotalClicks(totalClicks + 1);
      }

      if (totalClicks >= 72) {

        reset = true;
        webgazer.stopCalibration();

        // turn off calibration grid points
        const calibrationGrid = document.getElementById("calibrationGrid");
        calibrationGrid.style.display = "none";

        // turn on countdown number at centre of screen
        const countdownDiv = document.getElementById("countdown");
        countdownDiv.style.display = "block";

        // obtain calibration area box
        const calibrationArea = document.getElementById("calibrationArea");
        const calibrationArea_rect = calibrationArea.getBoundingClientRect();

        setAccuracy(await calcAccuracy(calibrationArea_rect, countdownDiv)); // calculate accuracy of calibration

        webgazer.end();
        webgazer.params.showGazeDot = false;

        calibrationData = webgazer.getRegressionData();

        try {
        localStorage.setItem("calibration", JSON.stringify(calibrationData));
        } catch(error)
        {
          console.error("Failed to save calibration data to localStorage:", error);
          localStorage.removeItem("calibration");
        }

        setCalibrationLive(false);

        const date = Date.now(); // Get current timestamp when calibration data is sent

        const bodyContents = { data: calibrationData,  timestamp: date, accuracy: accuracy };

        // Send calibration data to the backend
        const response = await reauthenticatingFetch("POST", `http://localhost:8000/api/user/calibrate/`, bodyContents)

        if(response.error)
          console.log(response.error);
        else
          console.log(response.message);

        setCalibrationSkip(true);
      }

      // reset circle colours back to unfilled
      if(reset)
      {
        for (var i = 0; i < 24; i++)
        {
          newClickCounts[i] = 0;
        }
        setClickCounts(newClickCounts);
        reset = false;

      }
    }
  };

  const getColor = (clickCount) => {
    switch (clickCount) {
      case 1:
        return "#B3D9B5";
      case 2:
        return "#66B266";
      case 3:
        return "#06760D";
      default:
        return "transparent";
    }
  };

  const restartCalibration = () => {
    calibrationData = []
    localStorage.removeItem("calibration");
    setTotalClicks(1);
    setCalibrationSkip(false);
    setCalibration(true);
    setLoadingProgress(0);
  };

  const finishCalibration = () => {
    // Move to next webpage
    toReadingPage();
  };

  if (isCalibrationGETLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "20px" }}>
          Checking Calibration Data...
        </Typography>
      </div>
    );
  }

  if (isLoading && performCalibration && !isCalibrationGETLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "20px" }}>
          Loading WebGazer...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={loadingProgress}
          style={{ width: "80%", marginTop: "20px" }}
        />
      </div>
    );
  }
  
  if(skipCalibration)
  {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f9f9f9",
          userSelect: "none"
        }}
      >
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          Calibration data ready.
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" style={{ marginBottom: "20px", marginRight: "20px"}}>
            Last calibration date:  <span style={{ fontWeight: 'bold' }}>{calibrationDate}</span>
          </Typography>
          <Typography variant="h6" style={{ marginBottom: "20px" }}>
            Accuracy: <span style={{ fontWeight: 'bold', color: accuracy < 50 ? 'red' : (accuracy >= 75 ? 'green' : 'orange') }}>{accuracy}%</span>
          </Typography>
        </Box>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
        Do you want to re-calibrate?
        </Typography>
        <Typography variant="h7" style={{ marginBottom: "20px" }}>
            {accuracy >= 75 ? (
                <>Please re-calibrate if you've <span style={{ fontWeight: 'bold' }}>switched location or devices</span> since your last calibration</>
            ) : (
                <>We recommend you to <span style={{ fontWeight: 'bold' }}>improve the accuracy</span> of your calibration</>
            )}
        </Typography>
        <Button onClick={restartCalibration} variant="outlined" sx={{mb: "20px"}}><span style={{ fontWeight: 'bold' }}>Yes</span></Button>
        <Button onClick={finishCalibration} variant="contained">No,&nbsp;<span style={{ fontWeight: 'bold' }}> continue to text reading</span></Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
        userSelect: "none",
        paddingTop: "35px"
      }}
    >
      {/* <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <Typography variant="h3" fontWeight="bold" sx={{mt: "100px"}}>
          Calibration:
        </Typography>
        <Typography variant="h7">
          To calibrate the eye tracker, please click each circle, while looking
          at it, until filled.
        </Typography>
      </div> */}

      <div
        id = "calibrationArea"
        style={{
          width: "100%",
          height: "85vh",
          border: "2px dashed #06760D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <Typography id="countdown" variant="h3" sx={{display: "none"}}>5</Typography>
        <div
          id = "calibrationGrid"
          style={{
            display: "grid",
            gridTemplateRows: "repeat(3, 1fr)",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: `${window.innerWidth / 10}px`
          }}
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "3px solid #06760D",
                backgroundColor: getColor(clickCounts[index]),
                cursor: "pointer"
              }}
              onClick={() => handleCalibrationClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalibrationPage;
