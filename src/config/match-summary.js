export const matchActions = [
  {
    status: "STARTED",
    matchStatusTypeClass: "badge-success",
    matchStatusType: "Match Started",
    showMatchLink: true,
    showEmbedLink: true,
  },
  {
    status: "MATCH_ENDED",
    matchStatusTypeClass: "badge-danger",
    matchStatusType: "Match Ended",
    showMatchLink: true,
    showEmbedLink: false,
  },
  {
    status: "INNINGS_BREAK",
    matchStatusTypeClass: "badge-info",
    matchStatusType: "Innings Break",
    showMatchLink: false,
    showEmbedLink: true,
  },
  {
    status: "TOSS",
    matchStatusTypeClass: "badge-secondary",
    matchStatusType: "Toss",
    showMatchLink: false,
    showEmbedLink: true,
  },
];

export const iframeText = `<iframe id='iframe2' src="https://crikscore-666.web.app/match/MATCH_ID/scorecard" frameborder="0" style="overflow: hidden; height: 100%;
width: 100%; position: absolute;"></iframe>`;
//   '<iframe src="https://crikscore-666.web.app/match/MATCH_ID/scorecard" width="100%" height="300" style="border:1px solid black;"></iframe>';
