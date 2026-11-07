import { copyGoalVisualizationAsset } from '/home/enpasos/projects/skillpilot/scripts/deploy_goal_visualizations.ts'
const root = '/home/enpasos/projects/skillpilot'
const relative = 'mathematik/ce198bc9-b014-52ba-814f-25cc3e020668/ce198bc9-b014-52ba-814f-25cc3e020668.png'
copyGoalVisualizationAsset(root + '/curricula/DE/Gymnasium/visualizations/' + relative, root + '/backend/src/main/resources/static/assets/goal-visualizations', relative)
console.log('Existing deployment helper generated the one missing backend PNG copy')
