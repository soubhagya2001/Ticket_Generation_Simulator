import api from './api';

export const getTrainsBetweenStations = async (from, to) => {
  try {
    const response = await api.get(`/trains/betweenStations/`, {
      params: { from, to },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trains:', error);
    throw error;
  }
};

export const getTrainsBetweenStationsOnDate = async (from, to, date) => {
  try {
    const response = await api.get(`/trains/gettrainon`, {
      params: { from, to, date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trains on date:', error);
    throw error;
  }
};

export const getTrainRoute = async (trainNo) => {
  try {
    const response = await api.get(`/trains/getRoute`, {
      params: { trainNo },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching train route:', error);
    throw error;
  }
};

export const generateTicket = async (formData) => {
  try {
    const response = await api.post('/tickets/generate', formData, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error generating ticket:', error);
    throw error;
  }
};
