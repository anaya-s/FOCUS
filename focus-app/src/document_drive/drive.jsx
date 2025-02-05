import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "../utils/navigation";
import {
  Drawer,
  Button,
  Grid2,
  Card,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  CardMedia,
  CardHeader,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload,
  StarRounded,
  AccessTime,
  MoreHoriz,
} from "@mui/icons-material";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import SearchIcon from "@mui/icons-material/Search";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Swal from "sweetalert2";

import { parseText } from "../text_reader/textParsing";

function DocumentDrivePage() {
  /* Temporary data for document tiles - update this with real document data from backend */
  var files = [
    {
      name: "Document1.docx",
      thumbnail: "",
      isStarred: false,
      lastOpened: "1/11/2024",
    },
    {
      name: "Document2.docx",
      thumbnail: "",
      isStarred: true,
      lastOpened: "2/11/2024",
    },
    {
      name: "ProjectBrief.pdf",
      thumbnail: "",
      isStarred: false,
      lastOpened: "3/11/2024",
    },
    {
      name: "TechnicalReport.pdf",
      thumbnail: "",
      isStarred: false,
      lastOpened: "3/11/2024",
    },
    {
      name: "README.txt",
      thumbnail: "",
      isStarred: false,
      lastOpened: "4/11/2024",
    },
    {
      name: "Notes.docx",
      thumbnail: "",
      isStarred: false,
      lastOpened: "6/11/2024",
    },
    {
      name: "DocumentName6.pdf",
      thumbnail: "",
      isStarred: false,
      lastOpened: "6/11/2024",
    },
  ];

  const { toCalibration, toReadingPage } = useNavigation();

  const [fileDetails, setFileDetails] = useState(files);

  const sortAlphabetically = (files) =>
    [...files].sort((a, b) => a.name.localeCompare(b.name));

  const sortByDate = (files) =>
    [...files].sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened));

  const filterStarred = (files) => files.filter((file) => file.isStarred);

  const searchFiles = (query) => {
    return fileDetails.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const [allDocButtonState, setAllDocButtonState] = useState(true);
  const [recentButtonState, setRecentButtonState] = useState(false);
  const [starredButtonState, setStarredButtonState] = useState(false);
  const [documentTiles, setDocumentTiles] = useState(sortAlphabetically(fileDetails));

  const [searchQuery, setSearchQuery] = useState("");

  const [menuIndex, setMenuIndex] = useState(null);

  const showSearches = (query) => {
    if (query !== "") {
      setAllDocButtonState(false);
      setRecentButtonState(false);
      setStarredButtonState(false);

      setDocumentTiles(searchFiles(query));
    }

    return documentTiles;
  };

  const handleEnterKeySearches = (e) => {
    if (e.key === 'Enter') {
      showSearches(searchQuery);
    }
  };

  const changeStarredStatus = (index) => {
    documentTiles[index].isStarred = !documentTiles[index].isStarred;

    setFileDetails(sortAlphabetically(fileDetails));

    setDocumentTiles(
      allDocButtonState
        ? sortAlphabetically(fileDetails)
        : recentButtonState
        ? sortByDate(fileDetails)
        : filterStarred(fileDetails)
    );
  };

  const handleRename = (index, extension) => {
    Swal.fire({
      title: '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Rename File</span>',
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; justify-content: center; align-items: center; user-select: none">
          <p>Please enter a new name for the file: <span style="font-weight: bold">${documentTiles[index].name}</span></p>
        </div>
      `,
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      inputPlaceholder: "The file extension " + extension + " will be added to this name",
      width: "40vw",
      confirmButtonColor: "#06760D",
      allowOutsideClick: false,
      showDenyButton: true,
      showConfirmButton: true,
      allowEscapeKey: true,
      denyButtonText:
        '<span style="user-select: none; padding: 0">Cancel</span>',
      confirmButtonText:
        '<span style="user-select: none; padding: 0">Rename</span>',
      customClass: {
        container: 'custom-swal-container', // Apply the custom class
      },
      preConfirm: () => {
        const newFilename = Swal.getInput().value.trim();
        const restrictedCharacters = /[\\/:*?"<>|.]/;
        if (restrictedCharacters.test(newFilename)) {
          Swal.showValidationMessage('<div style="display: flex; flex-direction: column; align-items: center, justify-content: center, text-align: center"><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Filename contains restricted characters.</span><span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Please remove any \\ / : * ? " < > | . characters.</span></div>');
          return false;
        }
        if (!newFilename) {
          Swal.showValidationMessage('<span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">Filename cannot be empty. Please try again.</span>');
          return false;
        }
        if (fileDetails.some(file => file.name === newFilename + extension)) {
          Swal.showValidationMessage('<span style="font-family: Isotok Web, sans-serif; font-size: 16px; color: black; user-select: none">A file with this name already exists. Please try again.</span>');
          return false;
        }
        return newFilename + extension;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newFilename = result.value;
        const updatedTiles = [...fileDetails];
        updatedTiles[index].name = newFilename;
        setFileDetails(sortAlphabetically(updatedTiles));
        setDocumentTiles(
          allDocButtonState
            ? sortAlphabetically(updatedTiles)
          : recentButtonState
            ? sortByDate(updatedTiles)
          : starredButtonState
            ? filterStarred(updatedTiles)
          : showSearches(searchQuery)
        );
      }
    });
  };

  const handleDelete = (index) => {
    Swal.fire({
      title:
        '<span style="font-family: Isotok Web, sans-serif; font-size: 24px; color: black; user-select: none">Confirm File Deletion</span>',
      html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: black; display: flex; align-items: center; user-select: none">
        <img src="../../public/images/homepage/felix.png" alt="Felix" style="width: 150px; margin-top: 30px; user-select: none; pointer-events: none">
        <div style="margin-left: 20px; text-align: left; color: white; background-color: #30383F; border-radius: 15px; padding: 15px">
          <p>Are you sure you want to delete the file <span style="font-weight: bold">${documentTiles[index].name}</span>?</p>
          <p>This action cannot be undone.</p>
        </div>
      </div>
    `,
      icon: "warning",
      iconColor: "orange",
      width: "40vw",
      confirmButtonColor: "#06760D",
      allowOutsideClick: false,
      showDenyButton: true,
      showConfirmButton: true,
      allowEscapeKey: true,
      denyButtonText:
        '<span style="user-select: none; padding: 0">Cancel</span>',
      confirmButtonText:
        '<span style="user-select: none; padding: 0">Confirm</span>',
      customClass: {
        container: 'custom-swal-container' // Apply the custom class
      },
    }).then((result) => {
      if (result.isConfirmed) {
        var fileNameToRemove = documentTiles[index].name;
        documentTiles.splice(index, 1);
        var updatedFiles = fileDetails.filter(file => file.name !== fileNameToRemove)
        setFileDetails(updatedFiles);
        setDocumentTiles(
          allDocButtonState
            ? sortAlphabetically(updatedFiles)
          : recentButtonState
            ? sortByDate(updatedFiles)
          : starredButtonState
            ? filterStarred(updatedFiles)
          : showSearches(searchQuery)
        );
      }
    });
  };

  // Change this to retrieve data from database instead of getting from new uploaded file
  const handleFileSelection = async (e) => {

    const file = e.target.files[0];
    
    // Parse the text from the file and send it the text reader page
    const parsedText = await parseText(file);
    
    toCalibration(file, parsedText);
    // OR (depending on user preferences)
    // toReadingPage(file, parsedText);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    // Store file details and data in database

    // Parse the text from the file and send it the text reader page
    const parsedText = await parseText(file);
    
    toCalibration(file, parsedText);
    // OR (depending on user preferences)
    // toReadingPage(file, parsedText);
  };

  const fileInputRef = useRef(null);

  // Function to handle button click and trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-swal-container {
        z-index: 1500; /* Set the desired z-index */
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (allDocButtonState) {
      setRecentButtonState(false);
      setStarredButtonState(false);
      setDocumentTiles(sortAlphabetically(fileDetails));
    }
  }, [allDocButtonState]);

  useEffect(() => {
    if (recentButtonState) {
      setAllDocButtonState(false);
      setStarredButtonState(false);
      setDocumentTiles(sortByDate(fileDetails));
    }
  }, [recentButtonState]);

  useEffect(() => {
    if (starredButtonState) {
      setAllDocButtonState(false);
      setRecentButtonState(false);
      setDocumentTiles(filterStarred(fileDetails));
    }
  }, [starredButtonState]);

  // State to manage the menu's open/close state and the anchor element
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to handle the opening of the menu
  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  // Determine if the menu is open
  const isMenuOpen = Boolean(anchorEl);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        pt: 10,
        pb: 10,
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
          backgroundColor: "#f1f1f1",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            mt: 12,
          }}
        >
          <Typography variant="h7" gutterBottom>
            Upload a new document
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CloudUpload sx={{ mr: 1 }} />}
            onClick={handleButtonClick}
            sx={{
              mt: 4,
              mb: 5,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: "white",
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <div>
              <Typography variant="h6">Upload</Typography>
              <Typography variant="h7" color="textSecondary">
                .pdf .docx .txt
              </Typography>
            </div>
          </Button>
          <Divider sx={{ mb: 5, width: "100%" }}>OR</Divider>
          <Typography variant="h7" gutterBottom>
            Continue where you left off
          </Typography>
          <Button
            variant={allDocButtonState ? "contained" : "outlined"}
            onClick={() => setAllDocButtonState(true)}
            sx={{
              mt: 4,
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: allDocButtonState ? "" : "white",
            }}
          >
            All documents
          </Button>
          <Button
            variant={recentButtonState ? "contained" : "outlined"}
            onClick={() => setRecentButtonState(true)}
            startIcon={<AccessTime />}
            sx={{
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: recentButtonState ? "" : "white",
            }}
          >
            Recent
          </Button>
          <Button
            variant={starredButtonState ? "contained" : "outlined"}
            onClick={() => setStarredButtonState(true)}
            startIcon={<StarBorderRoundedIcon />}
            sx={{
              mb: 4,
              maxWidth: 175,
              borderWidth: 3,
              borderRadius: 30,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: starredButtonState ? "" : "white",
            }}
          >
            Starred
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "240px", mt: 2 }}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 5, userSelect: "none" }}
        >
          Welcome to your drive
        </Typography>
        <TextField
          placeholder="Search for documents by name or file extension"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleEnterKeySearches}
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: "auto",
            width: "60%",
            mb: 6,
            "& .MuiOutlinedInput-root": { borderRadius: "9999px" },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => showSearches(searchQuery)}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />

        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
          <Typography variant="h4" sx={{ml: "2vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> { allDocButtonState ? "All documents" : recentButtonState ? "Recently opened" : "Your favourites"}</span></Typography>

          {/* IDK if we are going to convert the tiles into list as well, maybe for later. If so, need to add buttons to switch between both layouts */}
          {/* <Box sx={{display: "flex", alignItems: "center", mr: "2vw"}}>
            <Typography variant="h6" sx={{mr: "10vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>

            <Typography variant="h6" sx={{mr: "10vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>
          </Box> */}

          <Typography variant="h6" sx={{mr: "2vw"}} gutterBottom> <span style={{fontWeight: "bold"}}> Total documents: {documentTiles.length} </span></Typography>

        </Box>

        <Grid2
          container
          spacing={3}
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {documentTiles.map((document, index) => (
            <Grid2 item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: "30px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
                }}
              >
                <CardHeader
                  title={<Typography variant="h6">{document.name}</Typography>}
                  action={
                    <Tooltip
                      title={
                        document.isStarred
                          ? "Remove from Starred"
                          : "Add to Starred"
                      }
                      placement="bottom"
                    >
                      <IconButton onClick={() => changeStarredStatus(index)}>
                        {document.isStarred ? (
                          <StarRounded />
                        ) : (
                          <StarBorderRoundedIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  }
                />
                <CardMedia
                  component="img"
                  height="194"
                  image={
                    document.thumbnail === ""
                      ? "/public/images/drive/Temp.png"
                      : document.thumbnail
                  }
                  alt="Temp"
                  sx={{ userSelect: "none", cursor: "pointer"}}
                  onClick={handleButtonClick} // let user choose whether to go calibration or reading pages!!! - default option can be chosen in settings
                />
                {/* TEMPORARY - Replace with menu asking whether to go directly to menu or calibration (depending on preferences set in settings)
                   Also use text from database instead of new upload */}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelection}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                {/* END OF TEMPORARY CODE */}
                <CardHeader
                  title={
                    <Typography variant="body2">
                      Opened on {document.lastOpened}
                    </Typography>
                  }
                  action={
                    <div>
                      <Tooltip title="More options" placement="top">
                        <IconButton
                          onClick={(event) => handleMenuOpen(event, index)}
                        >
                          <MoreHoriz />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorEl}
                        open={isMenuOpen && menuIndex === index}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                      >
                          <MenuItem onClick={() => handleRename(index, document.name.lastIndexOf('.') !== -1 ? document.name.substring(document.name.lastIndexOf('.')) : '')}>
                          <DriveFileRenameOutlineRoundedIcon
                            sx={{ mr: "1vw" }}
                          />
                          Rename
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(index)}>
                          <DeleteRoundedIcon sx={{ mr: "1vw" }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </div>
                  }
                />
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </Box>
  );
}

export default DocumentDrivePage;
