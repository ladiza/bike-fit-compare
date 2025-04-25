// Define the bike parameters interface
export interface BikeParameters {
	headTubeAngle: number; // in degrees
	seatTubeAngle: number; // in degrees
	seatTubeLength: number; // in mm
	chainStayLength: number; // in mm
	bottomBracketDrop: number; // in mm
	stack: number; // in mm
	reach: number; // in mm
	wheelDiameter: number; // etrto in mm
	spacersLength: number; // in mm
	stemLength: number; // in mm
	stemAngle: number; // in degrees
	handlebarReach: number; // in mm
	handlebarRaise: number; // in mm
}

// Default bike parameters (typical values for a medium trail bike)
export const defaultBikeParameters: BikeParameters = {
	headTubeAngle: 71.5,
	seatTubeAngle: 73,
	seatTubeLength: 460,
	chainStayLength: 430,
	bottomBracketDrop: 70,
	stack: 590,
	reach: 390,
	wheelDiameter: 622,
	spacersLength: 55,
	stemLength: 100,
	stemAngle: 10,
	handlebarReach: 75,
	handlebarRaise: 0
};

// Define a second set of default parameters for comparison (slightly different geometry)
export const defaultBikeParameters2: BikeParameters = {
	headTubeAngle: 71.5,
	seatTubeAngle: 73,
	seatTubeLength: 460,
	chainStayLength: 430,
	bottomBracketDrop: 70,
	stack: 590,
	reach: 390,
	wheelDiameter: 622,
	spacersLength: 55,
	stemLength: 100,
	stemAngle: 10,
	handlebarReach: 75,
	handlebarRaise: 0
};
