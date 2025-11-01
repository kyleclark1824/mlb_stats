// Function to fetch data from your new API
export async function fetchTeamsFromDB() {
  try {
    const response = await fetch('/api/teams');
    if (!response.ok) throw new Error('Failed to fetch teams');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function fetchPlayersFromDB() {
  try {
    const response = await fetch('/api/players');
    if (!response.ok) throw new Error('Failed to fetch players');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Function to save data to your database
export async function saveTeamToDB(teamData: unknown) {
  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) throw new Error('Failed to save team');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function savePlayerToDB(playerData: unknown) {
  try {
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });
    if (!response.ok) throw new Error('Failed to save player');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
// Function to fetch data from your new API
