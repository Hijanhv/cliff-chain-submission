export type Vesting = {
  "version": "0.1.0",
  "name": "vesting",
  "instructions": [
    {
      "name": "createVestingAccount",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        }
      ]
    },
    {
      "name": "createEmployeeVesting",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "beneficiary",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vestingAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "employeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "totalAmount",
          "type": "i64"
        },
        {
          "name": "cliffTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimTokens",
      "accounts": [
        {
          "name": "beneficiary",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "employeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vestingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "employeeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "employeeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "publicKey"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalAmount",
            "type": "i64"
          },
          {
            "name": "totalWithdrawn",
            "type": "i64"
          },
          {
            "name": "cliffTime",
            "type": "i64"
          },
          {
            "name": "vestingAccount",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vestingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "companyName",
            "type": "string"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ClaimNotAvailableYet",
      "msg": "Claiming is not available yet."
    },
    {
      "code": 6001,
      "name": "NothingToClaim",
      "msg": "There is nothing to claim."
    }
  ]
};

export const IDL: Vesting = {
  "version": "0.1.0",
  "name": "vesting",
  "instructions": [
    {
      "name": "createVestingAccount",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vestingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        }
      ]
    },
    {
      "name": "createEmployeeVesting",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "beneficiary",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vestingAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "employeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "totalAmount",
          "type": "i64"
        },
        {
          "name": "cliffTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimTokens",
      "accounts": [
        {
          "name": "beneficiary",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "employeeAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vestingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "employeeTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "companyName",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "employeeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "publicKey"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalAmount",
            "type": "i64"
          },
          {
            "name": "totalWithdrawn",
            "type": "i64"
          },
          {
            "name": "cliffTime",
            "type": "i64"
          },
          {
            "name": "vestingAccount",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vestingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "companyName",
            "type": "string"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ClaimNotAvailableYet",
      "msg": "Claiming is not available yet."
    },
    {
      "code": 6001,
      "name": "NothingToClaim",
      "msg": "There is nothing to claim."
    }
  ]
};
