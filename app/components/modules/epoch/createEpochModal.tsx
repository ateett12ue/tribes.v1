import {
  Grow,
  IconButton,
  Modal,
  Tooltip,
  Typography,
  TextField,
  Autocomplete,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  checkboxClasses,
} from "@mui/material";
import React, { useState } from "react";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import { Box } from "@mui/system";
import { ModalHeading, PrimaryButton } from "../../elements/styledComponents";
import CloseIcon from "@mui/icons-material/Close";
import { useBoard } from "../taskBoard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMoralis } from "react-moralis";
import { Member } from "../../../types";
import { startEpoch } from "../../../adapters/moralis";

type Props = {};

const CreateEpochModal = (props: Props) => {
  const { data } = useBoard();
  const { Moralis } = useMoralis();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("");
  const [strategy, setStrategy] = useState("");
  const [budget, setBudget] = useState("");
  const [isChecked, setIsChecked] = useState(
    Array(data.members?.length).fill(false)
  );
  const [allocations, setAllocations] = useState(
    Array(data.members?.length).fill(100)
  );

  const toggleCheckboxValue = (index: number) => {
    setIsChecked(isChecked.map((v, i) => (i === index ? !v : v)));
  };

  const handleAllocation = (index: number, value: number) => {
    setAllocations(
      allocations.map((v, i) => (i === index ? value : allocations[i]))
    );
  };

  const getMembers = () => {
    var members = [];
    for (let i = 0; i < data.members.length; i++) {
      if (isChecked.at(i)) {
        data.members[i]["allocation"] = allocations.at(i);
        members.push(data.members.at(i));
      }
    }
    return members;
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <Tooltip title="Start Epoch">
        <IconButton
          sx={{ mb: 0.5, p: 1.7 }}
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <PlayCircleFilledWhiteIcon />
        </IconButton>
      </Tooltip>
      <Modal open={isOpen} onClose={handleClose} closeAfterTransition>
        <Grow in={isOpen} timeout={500}>
          <Box sx={modalStyle}>
            <ModalHeading>
              <Typography color="primary">Start Epoch</Typography>
              <Box sx={{ flex: "1 1 auto" }} />
              <IconButton sx={{ m: 0, p: 0.5 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </ModalHeading>
            <ModalContent>
              <TextField
                placeholder="Epoch Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Autocomplete
                options={["Task", "Contribution"]}
                //getOptionLabel={(option) => option.symbol}
                value={type}
                onChange={(event, newValue) => {
                  setType(newValue as string);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="filled-hidden-label-normal"
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Epoch Type"
                  />
                )}
              />
              <TextField
                id="filled-hidden-label-normal"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Duration (in days)"
              />
              <TextField
                id="filled-hidden-label-normal"
                value={budget}
                onChange={(event) => {
                  setBudget(event.target.value);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Budget (in Preferred token)"
              />
              <Autocomplete
                options={["Quadratic voting"]}
                //getOptionLabel={(option) => option.symbol}
                value={strategy}
                onChange={(event, newValue) => {
                  setStrategy(newValue as string);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="filled-hidden-label-normal"
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="Strategy"
                  />
                )}
              />
              <Accordion disableGutters>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  Members
                </AccordionSummary>
                <AccordionDetails>
                  <Table aria-label="simple table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            inputProps={{
                              "aria-label": "select all desserts",
                            }}
                            checked={isChecked.every((elem) => elem === true)}
                            onChange={(e) => {
                              setIsChecked(
                                Array(data.members.length).fill(
                                  e.target.checked
                                )
                              );
                              console.log(isChecked);
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#99ccff" }}>
                          Username
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#99ccff" }}>
                          Allocation
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.members?.map((member, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            padding="checkbox"
                          >
                            <Checkbox
                              color="primary"
                              inputProps={{
                                "aria-label": "select all desserts",
                              }}
                              checked={isChecked.at(index)}
                              onClick={() => {
                                toggleCheckboxValue(index);
                                console.log(isChecked);
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{member.username}</TableCell>
                          <TableCell align="right">
                            <TextField
                              id="filled-hidden-label-normal"
                              value={allocations[index]}
                              onChange={(event) => {
                                console.log(allocations);
                                console.log(event.target.value);

                                handleAllocation(
                                  index,
                                  parseInt(event.target.value)
                                );
                              }}
                              size="small"
                              type="number"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
              <PrimaryButton
                variant="outlined"
                sx={{ width: "50%", mt: 2 }}
                onClick={() => {
                  const members = getMembers();
                  startEpoch(
                    Moralis,
                    data.teamId,
                    data._id,
                    name,
                    type,
                    parseInt(duration),
                    strategy,
                    members as Member[],
                    parseInt(budget)
                  )
                    .then((res: any) => {
                      handleClose();
                    })
                    .catch((err: any) => alert(err));
                }}
              >
                Start Epoch
              </PrimaryButton>
            </ModalContent>
          </Box>
        </Grow>
      </Modal>
    </>
  );
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "10%",
  left: "25%",
  transform: "translate(-50%, -50%)",
  width: "50rem",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  overflow: "auto",
  maxHeight: "calc(100% - 128px)",
};

const ModalContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 32,
}));

export default CreateEpochModal;
