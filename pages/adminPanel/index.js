import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  CssBaseline,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Grid,
  Input,
  FormHelperText,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SampleData from './sample.json';
import GoogleMapReact from 'google-map-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SignalCellularNullOutlined } from '@mui/icons-material';
import getCookieData from '../../lib/auth/getCookieData';
import getServerCookieData from '../../lib/auth/getServerCookieData';

import EventDialog from '../../Components/EventDialog/EventDialog';
import EventCard from '../../Components/EventCard/EventCard';

export default function AdminPanel(props) {
  const [currentUser, setCurrentUser] = useState();
  const [currentToken, setCurrentToken] = useState();
  const { data: session } = useSession();
  useEffect(() => {
    const { data } = getCookieData(session);
    // const user = JSON.parse(decrypt(cookies.get('user')));
    // setUser(() => user);
    if (data) {
      setCurrentUser(() => data.user);
      setCurrentToken(() => data.token);
    }
  }, []);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventEditDialogOpen, setEventEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState();
  const event_list = props.evts;

  const handleAddEventOpen = () => {
    setEventDialogOpen(true);
  };

  const handleAddEventClose = () => {
    setEventDialogOpen(false);
  };

  const handleEditEventOpen = (e) => {
    setCurrentEvent(event_list[e.target.id]);
    setEventDialogOpen(true);
  };

  const handleEditEventClose = () => {
    setEventEditDialogOpen(false);
    setCurrentEvent();
  };

  return (
    <Container component={`main`}>
      <CssBaseline />
      <Box
        sx={{
          maxWidth: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1em',
          margin: 'auto',
          marginTop: 8,
        }}
      >
        <Typography sx={{ width: `100%`, textAlign: `center` }} variant={`h5`}>
          Events by: {currentUser && currentUser.first_name}
        </Typography>
        <Button
          sx={{ display: 'flex', gap: '1em', alignItems: 'center' }}
          variant={`contained`}
          onClick={handleAddEventOpen}
        >
          Add an Event <AddBoxOutlinedIcon />
        </Button>
        <EventDialog
          open={eventDialogOpen}
          onClose={handleAddEventClose}
          eventInfo={null}
          user_token={currentToken}
        />
      </Box>
      <Grid
        sx={{ mt: 8, justifyContent: 'center', gap: '2em', mb: 4 }}
        container
        fullWidth
      >
        {event_list &&
          event_list.map((curr_event, idx) => (
            <div key={idx}>
              <EventCard
                openDialog={handleEditEventOpen}
                event_name={curr_event.name}
                id={idx}
                image={curr_event.image_url}
                event_id={curr_event.id}
              />
            </div>
          ))}
        <EventDialog
          open={eventEditDialogOpen}
          onClose={handleEditEventClose}
          eventInfo={currentEvent}
          user_token={currentToken}
        />
      </Grid>
    </Container>
  );
}

export async function getServerSideProps(context) {
  const { data } = getServerCookieData(context);
  const { token } = data;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}club/`, {
    method: `GET`,
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!res || res.status != 200) {
    return {
      props: {
        status: res.status,
        error: true,
      },
    };
  }
  const events = await res.json();

  return {
    props: {
      evts: events,
      status: res.status,
      error: false,
    },
  };
}
