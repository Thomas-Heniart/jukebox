export const updatePlaylistItems = (
  votes: { id: string; votes: number }[],
  currentTrackId: string,
): Array<string> => {
  if (votes.length <= 2) return votes.map((track) => track.id);
  const result = new Array<string>(votes.length);
  const currentTrackIdx = votes.findIndex(
    (track) => track.id === currentTrackId,
  );
  result[currentTrackIdx] = votes.find(
    (track) => track.id === currentTrackId,
  )!.id;
  const nextTracks = votes
    .sort((a, b) => b.votes - a.votes)
    .filter((track) => track.id !== currentTrackId);
  let j = 0;
  for (let i = currentTrackIdx + 1; i < votes.length; i++) {
    result[i] = nextTracks[j].id;
    j++;
  }
  for (let i = 0; i < currentTrackIdx; i++) {
    result[i] = nextTracks[j].id;
    j++;
  }
  return result;
};
