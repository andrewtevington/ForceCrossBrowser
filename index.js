function getFeature(rallyApi, featureId, callback) {
	rallyApi.query({
		type: "portfolioitem",
		limit: 1,
		fetch: ["Project"],
		query: queryUtils.where("FormattedID", "=", featureId)
	}, function(error, response) {
		if (error) {
			console.log(error);
		} else if (response.Results.length) {
			callback(response.Results[0]);
		}
	});
}

function getRelease(rallyApi, releaseName, project, callback) {
	rallyApi.query({
		type: "release",
		limit: 1,
		query: queryUtils.where("Name", "=", releaseName).and("Project", "=", project)
	}, function(error, response) {
		if (error) {
			console.log(error);
		} else if (response.Results.length) {
			callback(response.Results[0]);
		}
	});
}

function getAcceptedUserStories(rallyApi, release, project, callback) {
	rallyApi.query({
		type: "hierarchicalrequirement",
		limit: 1000,
		fetch: ["Name"],
		query: queryUtils.where("Release", "=", release).and("Project", "=", project).and("ScheduleState", "=", "Accepted")
	}, function(error, response) {
		if (error) {
			console.log(error);
		} else {
			callback(response.Results);
		}
	});
}

function parseCompanyKey(userStory) {
	var spaceSplit = userStory.Name.split(" ");
	return spaceSplit[spaceSplit.length - 1].substr(1).split(")")[0];
}

function forceCompany(dynamoInstance, companyKey) {
	var queryParams = {
		TableName: "Tenants",
		Key: {
			"CompanyKey": {
				"S": companyKey
			}
		}
	};

	dynamoInstance.getItem(queryParams, function(readError, data) {
		if (readError) {
			console.log(readError);
		} else {
			var updateData = Object.assign({}, data);
			var oldUrl = (updateData.Item.Url.S || "").trim().toLowerCase();
			var newUrl = oldUrl;
			
			if (oldUrl === "classic.pestpac.com") {
				newUrl = "app.pestpac.com";
			} else if (oldUrl === "www80.mypestpac.com") {
				newUrl = "newwest.mypestpac.com";
			}
			
			updateData.TableName = "Tenants";
			updateData.Item.ForceUrl = { "N": "1" };
			updateData.Item.Url = { "S": newUrl };
			
			console.log(companyKey + " old url: " + oldUrl);
			console.log(companyKey + " new url: " + newUrl);
			
			dynamoInstance.putItem(updateData, function(writeError) {
				if (writeError) {
					console.log(writeError);
				}
			});
		}
	});
}

var auth = require("./auth");
var rally = require("rally");
var rallyApi = rally(auth.rally);
var queryUtils = rally.util.query;
var aws = require("aws-sdk");
var dynamoInstance = new aws.DynamoDB(auth.aws);
var featureId = (process.argv[2] || "").trim();
var releaseName = (process.argv[3] || "").trim();

if (featureId && releaseName) {
	getFeature(rallyApi, featureId, function(feature) {
		getRelease(rallyApi, releaseName, feature.Project, function(release) {
			getAcceptedUserStories(rallyApi, release, feature.Project, function(userStories) {
				userStories.map(function(userStory) {
					forceCompany(dynamoInstance, parseCompanyKey(userStory));
				});
			});
		});
	});
}