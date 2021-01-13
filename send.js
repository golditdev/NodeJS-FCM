var admin = require('firebase-admin')
var serviceAccount = require('server_key.json')

const { SuccessResponse, ErrorResponse } = require('../../../utils/response')
const tokenService = require('../../../services/token')

exports.handler = async (event, eventRoute) => {
  try {
    const { httpMethod, queryStringParameters, body } = event
    const jsonBody = JSON.parse(body)

    switch (httpMethod) {
      case 'POST': {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          })
        }

        var message = {
          token: jsonBody.device_token,
          notification: {
            body: 'Notification from FCM',
            title: 'FCM Notification',
          },
          android: {
            notification: {
              click_action: 'android.intent.action.MAIN',
            },
          },
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                badge: 1,
                sound: 'default',
              },
            },
          },
        }

        // Send a message to the device corresponding to the provided
        // registration token.
        admin
          .messaging()
          .send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response)
          })
          .catch((error) => {
            console.log('Error sending message:', error)
          })

        return SuccessResponse({
          error: false,
          message: 'Sent push notifications successfully',
          data: jsonBody.device_token,
        })
      }
      default: {
        throw new Error('Not implemented method!')
      }
    }
  } catch (err) {
    return ErrorResponse(err)
  }
}
