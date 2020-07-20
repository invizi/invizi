#!/usr/bin/env bash
! rg 'let ENCRYPT = false' src &&
! rg 'USE_LOCAL_URL = true' src
