// Utility functions for handling dates properly
export const formatDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Format: Monday, January 9, 2026
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Format: 01/09/2026
    return date.toLocaleDateString('en-US');
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};
