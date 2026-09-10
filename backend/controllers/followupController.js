const FollowupMessage = require("../models/FollowupMessage");

const GRAPH_API_VERSION =
    process.env.WHATSAPP_GRAPH_API_VERSION || "v22.0";

const normalizeNumber = (value) => {
    let number = String(value || "").replace(/[^\d]/g, "");

    if (number.length === 10) {
        number = `91${number}`;
    }

    return /^\d{10,15}$/.test(number) ? number : null;
};

const parseRecipients = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsedValue = JSON.parse(value);
            return Array.isArray(parsedValue)
                ? parsedValue
                : [value];
        } catch {
            return [value];
        }
    }

    return [];
};

const getWhatsAppConfig = () => {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
        return null;
    }

    return {
        accessToken,
        phoneNumberId,
        baseUrl: `https://graph.facebook.com/${GRAPH_API_VERSION}`,
    };
};

const getApiError = async (response) => {
    try {
        const body = await response.json();
        return body.error?.message || "WhatsApp API request failed";
    } catch {
        return "WhatsApp API request failed";
    }
};

const createWhatsAppError = (message) => {
    const error = new Error(message);
    error.statusCode = 502;
    return error;
};

const uploadImage = async (file, config) => {



     console.log("PHONE NUMBER ID:", config.phoneNumberId);
    console.log("TOKEN EXISTS:", !!config.accessToken);


    const formData = new FormData();

    formData.append("messaging_product", "whatsapp");
    formData.append(
        "file",
        new Blob([file.buffer], { type: file.mimetype }),
        file.originalname
    );


   
   

    const response = await fetch(
        `${config.baseUrl}/${config.phoneNumberId}/media`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
            },
            body: formData,
        }
    );

    // 
    
    if (!response.ok) {
    const errorMessage = await getApiError(response);


        console.error("WHATSAPP IMAGE ERROR:", response.status, errorMessage);
        throw createWhatsAppError(errorMessage);
}

    const body = await response.json();

    if (!body.id) {
        throw new Error("WhatsApp image upload did not return a media id");
    }

    return body.id;
};

const sendMessage = async ({ number, message, mediaId, config }) => {
    const messageBody = mediaId
        ? {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: number,
              type: "image",
              image: {
                  id: mediaId,
                  caption: message,
              },
          }
        : {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: number,
              type: "text",
              text: {
                  preview_url: false,
                  body: message,
              },
          };

    const response = await fetch(
        `${config.baseUrl}/${config.phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageBody),
        }
    );

    // if (!response.ok) {
    //     throw new Error(await getApiError(response));
    // }


    if (!response.ok) {
    const errorMessage = await getApiError(response);


        console.error("WHATSAPP API ERROR:", response.status, errorMessage);
        throw createWhatsAppError(errorMessage);
}

    const body = await response.json();

    console.log("WHATSAPP STATUS:", response.status);
    console.log("WHATSAPP RESPONSE:", body);

    return body.messages?.[0]?.id || "";
};

const sendFollowup = async (req, res) => {
    try {
        const rawRecipients = parseRecipients(
            req.body.whatsappNumbers || req.body.whatsappNumber
        );
        const recipients = [
            ...new Set(rawRecipients.map(normalizeNumber).filter(Boolean)),
        ];
        const message = String(req.body.message || "").trim();

        if (!recipients.length) {
            return res.status(400).json({
                success: false,
                message: "At least one valid WhatsApp number is required",
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const config = getWhatsAppConfig();

        if (!config) {
            return res.status(503).json({
                success: false,
                message:
                    "WhatsApp service is not configured. Add WhatsApp API credentials.",
            });
        }

        let mediaId = "";

        if (req.file) {
            mediaId = await uploadImage(req.file, config);
        }

        const deliveryResults = [];

        for (const number of recipients) {
            try {
                const messageId = await sendMessage({
                    number,
                    message,
                    mediaId,
                    config,
                });

                deliveryResults.push({
                    number,
                    status: "sent",
                    messageId,
                });
            } catch (error) {
                deliveryResults.push({
                    number,
                    status: "failed",
                    error: error.message,
                });
            }
        }

        const sentCount = deliveryResults.filter(
            (result) => result.status === "sent"
        ).length;
        const status = sentCount === recipients.length
            ? "sent"
            : sentCount > 0
                ? "partial"
                : "failed";

        const followup = await FollowupMessage.create({
            recipients: deliveryResults,
            message,
            image: req.file
                ? {
                      name: req.file.originalname,
                      mimeType: req.file.mimetype,
                      size: req.file.size,
                  }
                : undefined,
            status,
        });

        return res.status(status === "failed" ? 502 : 201).json({
            success: status !== "failed",
            message:
                status === "sent"
                    ? "WhatsApp follow-up sent successfully"
                    : status === "partial"
                        ? "WhatsApp follow-up sent to some numbers"
                        : "WhatsApp follow-up could not be sent",
            error: deliveryResults.find(
                (result) => result.status === "failed"
            )?.error || "",
            followup,
        });
    } catch (error) {
        console.error("SEND FOLLOWUP ERROR:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: "Unable to send WhatsApp follow-up",
            error: error.message,
        });
    }
};

module.exports = {
    sendFollowup,
};