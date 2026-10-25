package com.smartpatient.sharing.dto;

import jakarta.validation.constraints.NotBlank;

public class RedeemShareRequest {

    @NotBlank(message = "Sharing code is required")
    private String sharingCode;

    public RedeemShareRequest() {}

    public RedeemShareRequest(String sharingCode) {
        this.sharingCode = sharingCode;
    }

    public String getSharingCode() {
        return sharingCode;
    }

    public void setSharingCode(String sharingCode) {
        this.sharingCode = sharingCode;
    }
}
