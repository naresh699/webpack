node {
	
	def gruntExec = 'node_modules/.bin/grunt'
	def webpackExec = 'build-prod-app_fspandora_richUI'
	def jiraUpdateEnabled = false
	def isUatEnvironment = false
	def gitBranch = env.GIT_BRANCH_TO_USE
	echo "Using git branch: ${gitBranch}"
	
	stage('Initialize')
	{
		/*
		echo '============== START Initialize stage ======================'
		echo 'currentBuild.result: ' + currentBuild.result
		echo 'currentBuild.currentResult: ' + currentBuild.result
		*/
		
		env.BUILD_TAG_CLEANED = "${env.BUILD_TAG}".replaceAll(/\%\d[a-zA-Z]/, "-").replaceAll(/[^\w-]+/, "")
		sh "printenv"
		
		if(!env.ENVIRONMENT_INSTANCE?.trim())
		{
			error 'Environment instance must be set (env.ENVIRONMENT_INSTANCE)'
		}
		
		if(env.JIRA_UPDATE != 'true')
		{
			jiraUpdateEnabled = false
		} else {
			jiraUpdateEnabled = true
		}
		
		if(env.UAT_ENVIRONMENT != 'true')
		{
			isUatEnvironment = false
		} else {
			isUatEnvironment = true
		}

		if(env.ENVIRONMENT_INSTANCE.indexOf('staging') != -1)
		{
			env.ENABLE_TWO_FACTOR = true
		} else {
			env.ENABLE_TWO_FACTOR = false
		}
		
		if((!CLEAN_BEFORE_CHECKOUT?.trim()) || (CLEAN_BEFORE_CHECKOUT != 'true'))
		{
			CLEAN_BEFORE_CHECKOUT = false
		} else {
			CLEAN_BEFORE_CHECKOUT = true
		}
		
		if((!ACTIVATE_NEW_VERSION?.trim()) || (ACTIVATE_NEW_VERSION != 'true'))
		{
			ACTIVATE_NEW_VERSION = false
		} else {
			ACTIVATE_NEW_VERSION = true
		}
		
		if((!IMPORT_METADATA?.trim()) || (IMPORT_METADATA != 'true'))
		{
			IMPORT_METADATA = false
		} else {
			IMPORT_METADATA = true
		}
		
		if((!IMPORT_DEMODATA?.trim()) || (IMPORT_DEMODATA != 'true'))
		{
			IMPORT_DEMODATA = false
		} else {
			IMPORT_DEMODATA = true
		}
		
		echo """\
		Environment instance: ${env.ENVIRONMENT_INSTANCE}
		Two Factor Enabled: ${env.ENABLE_TWO_FACTOR}
		Import Config & Meta-data: ${IMPORT_METADATA}
		Import Demo data: ${IMPORT_DEMODATA}
		JIRA Update: ${jiraUpdateEnabled}
		UAT environment: ${isUatEnvironment}
		Git Branch: ${gitBranch}
		Clean Before Checkout: ${CLEAN_BEFORE_CHECKOUT}
		"""
		
		if(env.ENVIRONMENT_INSTANCE.indexOf('staging') != -1)
		{
			try
			{
				echo """\
				Two-factor P12 (DEPLOY_TWO_FACTOR_P12): ${DEPLOY_TWO_FACTOR_P12}
				Two-factor P12 Pass (DEPLOY_TWO_FACTOR_PASS): ${DEPLOY_TWO_FACTOR_PASS}
				"""
			} catch (MissingPropertyException e) {
				error 'Missing parameters: DEPLOY_TWO_FACTOR_P12, DEPLOY_TWO_FACTOR_PASS'
			}  

			
			if(!DEPLOY_TWO_FACTOR_P12?.trim())
			{
				error 'Staging Two Factor P12 File Credentials ID is missing (DEPLOY_TWO_FACTOR_P12)'
			}
			if(!DEPLOY_TWO_FACTOR_PASS?.trim())
			{
				error 'Staging Two Factor P12 File Password Credentials ID is missing (DEPLOY_TWO_FACTOR_PASS)'
			}
			
		} else {
			try
			{
				echo "Deploy credentials: ${DEPLOY_CREDENTIALS}"
			} catch (MissingPropertyException e) {
				error 'Deployment credentials ID is missing (DEPLOY_CREDENTIALS)'
			}  

			if(!DEPLOY_CREDENTIALS?.trim())
			{
				error 'Deployment credentials ID is missing (DEPLOY_CREDENTIALS)'
			}
		}
	}
	
    stage('Checkout')
	{
		/*
		echo '============== START Checkout stage ======================'
		echo 'currentBuild.result: ' + currentBuild.result
		echo 'currentBuild.currentResult: ' + currentBuild.result
		*/
		
		sh 'rm -rf buildsuite/node_modules/isbinaryfile/tests/fixtures/' 
		
		if ((CLEAN_BEFORE_CHECKOUT == true) || (CLEAN_BEFORE_CHECKOUT == 'true')) {
			sh "rm -rf buildsuite/node_modules/isbinaryfile/tests/fixtures/"
			
			echo "Performing clean checkout from branch ${gitBranch}"
			
			checkout([$class: 'GitSCM', branches: [[name: gitBranch]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'CleanBeforeCheckout'], [$class: 'ChangelogToBranch', options: [compareRemote: 'refs/heads', compareTarget: gitBranch.minus('origin/')]]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'BITBUCKET_JENKINS', url: 'https://bitbucket.org/PFSweb/dw_pandora_flagship.git']]])
			

			//checkout([$class: 'GitSCM', branches: [[name: gitBranchSpecified]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'ChangelogToBranch', options: [compareRemote: 'origin', compareTarget: gitBranchSpecified.minus('origin/')]]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'BITBUCKET_JENKINS', url: 'https://bitbucket.org/PFSweb/dw_pandora_flagship.git']]])
		}
		else {
			checkout([$class: 'GitSCM', branches: [[name: gitBranch]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'ChangelogToBranch', options: [compareRemote: 'refs/heads', compareTarget: gitBranch.minus('origin/')]]], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'BITBUCKET_JENKINS', url: 'https://bitbucket.org/PFSweb/dw_pandora_flagship.git']]])
		}
	}
	
    stage('Bootstrap')
	{
		/*
		echo '============== START Bootstrap stage ======================'
		echo 'currentBuild.result: ' + currentBuild.result
		echo 'currentBuild.currentResult: ' + currentBuild.result
		*/
		sh 'node -v'
        sh 'npm prune'
		try {
			sh 'npm install'	
		} catch (Exception e) {
			echo 'WARN: Could run successfully npm install in root directory: '+e.getMessage()
			currentBuild.result = 'UNSTABLE'
		}
        
		try {
			dir ('cartridges/') {
				sh 'npm prune'
				sh 'npm install'
			}
		} catch (Exception e) {
			echo 'WARN: Could run successfully npm install in cartridges directory: '+e.getMessage()
			currentBuild.result = 'UNSTABLE'
		}
		
		try {
			dir ('buildsuite/') {
				sh 'npm prune'
				sh 'npm install'
			}
		} catch (Exception e) {
			echo 'WARN: Could run successfully npm install in buildsuite directory: '+e.getMessage()
			currentBuild.result = 'UNSTABLE'
		}
		
		dir ('buildsuite/node_modules/isbinaryfile/tests/') {
            /*deleting a file with Russian chars in its name as it fails future builds which try to delete it through Java code of the Git Jenkins plugin - this file is used by the unit tests of the isbinaryfile module and should be safe to be deleted*/
			sh 'rm -rf fixtures/'
        }

    /*stage 'Lint Cartridges'
        dir ('cartridges/') {
            sh 'grunt --no-color lint'
        }
	*/
    /*stage 'Bootstrap Test'
        dir ('cartridges/') {
            //sh 'npm install -g phantomjs'
            //sh 'npm install --production -g selenium-standalone@latest'
            //sh 'selenium-standalone install'
        }*/

    /*stage 'Execute Tests'
        dir ('cartridges/') {
            sh 'selenium-standalone start'
            sh 'grunt --no-color test:unit'
            //sh 'grunt --no-color test:application'
        }*/
	}
	
    stage('Build')
	{
		/*
		echo '============== START Build stage ======================'
		echo 'currentBuild.result: ' + currentBuild.result
		echo 'currentBuild.currentResult: ' + currentBuild.result
		*/
		
		sh "npm run ${webpackExec}"
		sh "cd buildsuite && ${gruntExec} build"
        
		//Note: this path depends on the project name (e.g. "Pandora") - be sure to update it if the project name is changed in the /buildsuite/build/config.json file
		archiveArtifacts artifacts: 'buildsuite/output/Pandora/code/*.zip', excludes: null, fingerprint: true
	}
	
	lock(resource: "instance_${env.ENVIRONMENT_INSTANCE}", inversePrecedence: true)
	{
		stage('Deploy')
		{
			/*
			echo '============== START Deploy stage ======================'
			echo 'currentBuild.result: ' + currentBuild.result
			echo 'currentBuild.currentResult: ' + currentBuild.result
			*/
			if(env.ENVIRONMENT_INSTANCE.indexOf('staging') == -1)
			{
			
				withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: DEPLOY_CREDENTIALS,
							  usernameVariable: 'ENVIRONMENT_USER_NAME', passwordVariable: 'ENVIRONMENT_PASSWORD']]) {            
					dir ('buildsuite/') {
						echo 'Uploading the new build...'
						sh "${gruntExec} upload"
						
						if (ACTIVATE_NEW_VERSION)
						{
							echo 'Activating the new version...'
							sh "${gruntExec} activate"
						} else {
							echo 'The new version is not activated'
						}
						
					}
				}
			} else {
				withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: DEPLOY_CREDENTIALS,
							  usernameVariable: 'ENVIRONMENT_USER_NAME', passwordVariable: 'ENVIRONMENT_PASSWORD']]) {
					withCredentials([[$class: 'FileBinding', credentialsId: DEPLOY_TWO_FACTOR_P12, variable: 'TWO_FACTOR_CERT_PATH']]) {
						withCredentials([[$class: 'StringBinding', credentialsId: DEPLOY_TWO_FACTOR_PASS, variable: 'TWO_FACTOR_CERT_PASSWORD']]) {
							dir ('buildsuite/') {
								echo 'Uploading the new build...'
								sh "${gruntExec} upload"
								if (ACTIVATE_NEW_VERSION)
								{
									echo 'Activating the new version...'
									sh "${gruntExec} activate"
								} else {
									echo 'The new version is not activated'
								}
							}
						}
					}
				}
			}
		}
	
		stage('Import Config And Metadata')
		{
			/*
			echo '============== START Import Config And Metadata stage ======================'
			echo 'currentBuild.result: ' + currentBuild.result
			echo 'currentBuild.currentResult: ' + currentBuild.result
			*/
		
			if((env.ENVIRONMENT_INSTANCE.indexOf('development') == -1) && (env.ENVIRONMENT_INSTANCE.indexOf('staging') == -1) && (IMPORT_METADATA == true) && (IMPORT_DEMODATA == false))
			{
				withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: DEPLOY_CREDENTIALS,
							  usernameVariable: 'ENVIRONMENT_USER_NAME', passwordVariable: 'ENVIRONMENT_PASSWORD']]) {
					dir ('buildsuite/') {
						// Site initialization/configuration import (default source folder: sites/site_config_and_metadata)
						sh "${gruntExec} initSite"
						// Metadata import only. Metadata is always read from configuration data (default: sites/site_config_and_metadata/meta)
						sh "${gruntExec} importMeta"
					}
				}
			} else {
				echo 'Skiping config and metadata import step.'
			}
		}
		
		stage('Import Demo Data')
		{
			/*
			echo '============== START Import Demo data stage ======================'
			echo 'currentBuild.result: ' + currentBuild.result
			echo 'currentBuild.currentResult: ' + currentBuild.result
			*/
			if((env.ENVIRONMENT_INSTANCE.indexOf('development') == -1) && (env.ENVIRONMENT_INSTANCE.indexOf('staging') == -1) && (IMPORT_DEMODATA == true))
			{
				withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: DEPLOY_CREDENTIALS,
							  usernameVariable: 'ENVIRONMENT_USER_NAME', passwordVariable: 'ENVIRONMENT_PASSWORD']]) {
					dir ('buildsuite/') {
						// Site initialization/configuration import (default source folder: sites/site_config_and_metadata)
						sh "${gruntExec} initSite"
						// Demo data site import (default source folder: sites/site_demodata)
						sh "${gruntExec} initDemoSite"
						// Complete site import, including demo data (if given)
						sh "${gruntExec} importSite"
						// Metadata import. Metadata is always read from configuration data (default: sites/site_config_and_metadata/meta)
						//sh '${gruntExec} --no-color importMeta'						
					}
				}
			} else {
				echo 'Skiping demo data import step.'
			}
		}
	}

    stage('Generate Changelog')
	{
		/*
		echo '============== START Generate Changelog stage ======================'
		echo 'currentBuild.result: ' + currentBuild.result
		echo 'currentBuild.currentResult: ' + currentBuild.result
		*/
        passedBuilds = []
        lastSuccessfulBuild(passedBuilds, currentBuild);

        def changeLog = ""
		def jiraIssues = []
		def jiraIssueSelector = ""
		def changeLogObj = getChangeLog(passedBuilds)
		def affectedIssuesMessage = ""
		def affectedIssuesMessageHtml = ""
		changeLog = changeLogObj.changeLog
		jiraIssues = changeLogObj.jiraChanges
		
		if(jiraIssues.size() > 0)
		{
			jiraIssueSelector = jiraIssues.join(",")
			jiraIssuesWithLinks = getJiraIssueHtmlLinks(jiraIssues)
			def jiraIssuesWithLinksJoined = jiraIssuesWithLinks.join(',')
			affectedIssuesMessage = "JIRA issues deployed: ${jiraIssueSelector}"
			affectedIssuesMessageHtml = "JIRA issues deployed: ${jiraIssuesWithLinksJoined}"
			if(jiraUpdateEnabled == true)
			{
				if(isUatEnvironment)
				{
					step([$class: 'JiraIssueUpdateBuilder', jqlSearch: "(project in (PGRA) and status = 'Waiting for UAT Build') OR key in(${jiraIssueSelector})", workflowActionName: 'CI Deploy UAT'])
				} else {
					step([$class: 'JiraIssueUpdateBuilder', jqlSearch: "(project in (PGRA) and status = 'Waiting for Build') OR key in(${jiraIssueSelector})", workflowActionName: 'CI Deploy'])
				}
				
			} else {
				echo 'JIRA update is disabled for this build.'
			}
			
		} else {
			affectedIssuesMessage = "No affected JIRA issues found."
			affectedIssuesMessageHtml = affectedIssuesMessage
		}
		
		echo affectedIssuesMessage
        echo "changeLog ${changeLog}"
		def gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
		def shortCommit = gitCommit.take(6)
				
		def causesHtml = getBuildCauses(currentBuild)
		 
		def mailBody ="""\
A new build has finished. Some facts:
<br><br>
Build cause(s): ${causesHtml} <br>
Build URL: ${env.BUILD_URL} <br>
DW Version: ${env.BUILD_TAG_CLEANED} <br> 
DW Environment: ${env.ENVIRONMENT_INSTANCE} <br>
Build Commit: ${shortCommit} <br>
Build Branch: ${gitBranch} <br>
New Version Activated: ${ACTIVATE_NEW_VERSION} <br>
Configuration and Meta-data Imported: ${IMPORT_METADATA} <br>
Demo Data Imported: ${IMPORT_DEMODATA} <br>
${affectedIssuesMessageHtml} 
<br>
<br>
<br>
<b>Changelog:</b>
<br><br>
${changeLog}

"""

		def slackNotification ="""\
A new build has finished. Some facts:

Build cause(s): ${causesHtml}
Build URL: ${env.BUILD_URL} 
DW Version: ${env.BUILD_TAG_CLEANED} 
DW Environment: ${env.ENVIRONMENT_INSTANCE} 
Build Commit: ${shortCommit} 
Build Branch: ${gitBranch} 
New Version Activated: ${ACTIVATE_NEW_VERSION}
Configuration and Meta-data Imported: ${IMPORT_METADATA}
Demo Data Imported: ${IMPORT_DEMODATA}
${affectedIssuesMessageHtml} 

Changelog:

${changeLog}
"""

        
        if(!env.P_MAIL_NOTIFICATION_DISABLED)
		{
			try
			{
				mail bcc: '', body: mailBody, cc: '', from: '', replyTo: '', subject: 'Jenkins: Pandora Build Finished', mimeType: 'text/html', to: env.MAIL_RECIPIENTS
			} catch(Exception e)
			{
				echo 'WARN: Could not send mail notification: '+e.getMessage()
			}
			
		}
		
		try
		{			
			slackSend botUser: true, channel: 'sofia-pandora', message: slackNotification, token: '7OKyWWyxZwK52WKgJhcZPBhF'
		} catch(Exception e)
		{
			echo 'Could not send slack notification: '+e.getMessage()
		}
	}
	
	/*
	echo '=================== END ======================'
	echo 'currentBuild.result: ' + currentBuild.result
	echo 'currentBuild.currentResult: ' + currentBuild.result
	*/	
}

def lastSuccessfulBuild(passedBuilds, build) {
  if ((build != null) && (build.result != 'SUCCESS') && build.result != 'UNSTABLE') {
      passedBuilds.add(build)
      lastSuccessfulBuild(passedBuilds, build.getPreviousBuild())
   }
}

@NonCPS
def getJiraIssueHtmlLinks(jiraIssues) {
	def jiraIssuesWithLinks = jiraIssues.collect { jira ->
		return '<a href ="https://revsolutions.atlassian.net/browse/'+jira+'">'+jira+'</a>'
	}
	
	return jiraIssuesWithLinks
}

@NonCPS
def getBuildCauses(currentBuild)
{
	def causesHtml = ''
	
	def causes = currentBuild.rawBuild.getCauses()
	
	for (cause in causes) {
		causesHtml = causesHtml + cause.getShortDescription() + '<br>'
	}
	
	return causesHtml
}

@NonCPS
def getChangeLog(passedBuilds) {
    def log = ""
	def jiras = []
    for (int x = 0; x < passedBuilds.size(); x++) {
        def currentBuild = passedBuilds[x];
        def changeLogSets = currentBuild.rawBuild.changeSets
        for (int i = 0; i < changeLogSets.size(); i++) {
            def entries = changeLogSets[i].items
            for (int j = 0; j < entries.length; j++) {
                def entry = entries[j]
                log += "* ${entry.msg} by ${entry.author} <br>\n"
				jiras = jiras+(entry.msg).findAll(/([a-zA-Z][a-zA-Z0-9_]+-[1-9][0-9]*)/)
            }
        }
    }
	jiras.unique()
    return [changeLog: log, jiraChanges: jiras];
 }