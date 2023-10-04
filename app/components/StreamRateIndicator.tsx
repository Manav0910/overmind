import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Stream } from "@/app/payments/CreatedStreamList";

/* 
  Finds the best unit to display the stream rate in by changing the bottom of the unit from seconds
  to minutes, hours, days, etc.
*/
function displayStreamRate(streamRatePerSecond: number) {
  if (streamRatePerSecond == 0) {
    return "0 APT / s";
  }

  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / s`;
  }

  streamRatePerSecond *= 60; // to minutes
  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / min`;
  }

  streamRatePerSecond *= 60; // to hours
  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / hr`;
  }

  streamRatePerSecond *= 24; // to days
  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / day`;
  }

  streamRatePerSecond *= 7; // to weeks
  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / week`;
  }

  streamRatePerSecond *= 4; // to months
  if (Math.abs(streamRatePerSecond) >= 1) {
    return `${streamRatePerSecond.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })} APT / month`;
  }

  streamRatePerSecond *= 12; // to years

  return `${streamRatePerSecond.toLocaleString(undefined, {
    maximumFractionDigits: 3,
  })} APT / year`;
}

export default function StreamRateIndicator() {
  // wallet adapter state
  const { isLoading, account, connected } = useWallet();
  // stream rate state
  const [streamRate, setStreamRate] = useState(0);

  /* 
    Calculates and sets the stream rate
  */
  useEffect(() => {
    calculateStreamRate().then((streamRate) => {
      setStreamRate(streamRate);
    });
  });

  /*
    Calculates the stream rate by adding up all of the streams the user is receiving and subtracting
    all of the streams the user is sending.
  */
  const calculateStreamRate = async () => {

    /* 
      TODO #1: Fetch the receiver and sender streams using getReceiverStreams and getSenderStreams. 
            Then, calculate the stream rate by calculating and adding up the rate of APT per second 
            for each receiver stream and subtracting the rate of APT per second for each sender stream.
            Return the stream rate.
    */

    const receiverStreams = await getReceiverStreams();
    const senderStreams = await getSenderStreams();

    // putting this check as I got a runtime error saying Unhandled Runtime Error
    // TypeError: Cannot read properties of undefined (reading 'reduce')
    // Although I was not clear about this part logic I have implemented it as I understood
    console.log({ receiverStreams });
    if (receiverStreams === undefined || senderStreams === undefined) {
      // throw new Error("ReceiverStreams or SenderStreams is not an array");
      console.log("Error");
      return 0;
    }

    const receiverRate = receiverStreams?.completed.reduce(
      (totalRate: any, stream: { stream_amounts: any }) => {
        // Here I am assuming stream_amounts is the rate of APT per second for the receiver stream also assuming to take only completed
        return totalRate + stream.stream_amounts;
      },
      0
    );

    const senderRate = senderStreams.reduce(
      (totalRate: any, stream: { stream_amounts: any }) => {
        // Here I am assuming stream_amounts is the rate of APT per second for the sender stream.
        return totalRate + stream.stream_amounts;
      },
      0
    );
    let aptPerSec = receiverRate - senderRate;

    return aptPerSec;
  };

  const getSenderStreams = async () => {
    /*
     TODO #2: Validate the account is defined before continuing. If not, return.
   */
    if (!account) {
      return;
    }

    /*
       TODO #3: Make a request to the view function `get_senders_streams` to retrieve the streams sent by 
             the user.
    */

    let res: any;
    try {
      const body = {
        function: "get_senders_streams",
        type_arguments: ["sender_address"],
        arguments: [account.address],
      };
      res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
    } catch (err) {
      console.log(err);
      return [];
    }

    /* 
       TODO #4: Parse the response from the view request and create the streams array using the given 
             data. Return the new streams array.
 
       HINT:
        - Remember to convert the amount to floating point number
    */
    const streams = res.map(
      (stream: {
        receiver_addresses: any;
        start_timestamp_seconds: any;
        duration_in_seconds: any;
        stream_amounts: string;
        stream_ids: any;
      }) => ({
        receiver_addresses: stream.receiver_addresses,
        start_timestamp_seconds: stream.start_timestamp_seconds,
        duration_in_seconds: stream.duration_in_seconds,
        stream_amounts: parseFloat(stream.stream_amounts),
        stream_ids: stream.stream_ids,
      })
    );

    return streams;
  };

  const getReceiverStreams = async () => {
    /*
      TODO #5: Validate the account is defined before continuing. If not, return.
    */
    if (!account) {
      return;
    }

    /*
      TODO #6: Make a request to the view function `get_receivers_streams` to retrieve the streams sent by 
            the user.
    */
    let res: any;
    try {
      const body = {
        function: "get_receivers_streams",
        type_arguments: ["receiver_address"],
        arguments: [account.address],
      };
      res = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/view`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
    } catch (err) {
      console.log(err);
      return {
        pending: [],
        completed: [],
        active: [],
      };
    }
    /* 
      TODO #7: Parse the response from the view request and create an object containing an array of 
            pending, completed, and active streams using the given data. Return the new object.

      HINT:
        - Remember to convert the amount to floating point number
        - Remember to convert the timestamps to milliseconds
        - Mark a stream as pending if the start timestamp is 0
        - Mark a stream as completed if the start timestamp + duration is less than the current time
        - Mark a stream as active if it is not pending or completed
    */

    const pendingStreams = [];
    const completedStreams = [];
    const activeStreams = [];
    const currentTime = Date.now();

    for (let stream of res) {
      const amount = parseFloat(stream.stream_amounts);
      const startTime = stream.start_timestamp_seconds * 1000;
      const endTime = startTime + stream.duration_in_seconds * 1000;

      if (startTime === 0) {
        pendingStreams.push({
          sender_addresses: stream.sender_addresses,
          start_timestamp_seconds: stream.start_timestamp_seconds,
          duration_in_seconds: stream.duration_in_seconds,
          stream_amounts: amount,
          stream_ids: stream.stream_ids,
        });
      } else if (endTime < currentTime) {
        completedStreams.push({
          sender_addresses: stream.sender_addresses,
          start_timestamp_seconds: stream.start_timestamp_seconds,
          duration_in_seconds: stream.duration_in_seconds,
          stream_amounts: amount,
          stream_ids: stream.stream_ids,
        });
      } else {
        activeStreams.push({
          sender_addresses: stream.sender_addresses,
          start_timestamp_seconds: stream.start_timestamp_seconds,
          duration_in_seconds: stream.duration_in_seconds,
          stream_amounts: amount,
          stream_ids: stream.stream_ids,
        });
      }
    }

    return {
      pending: pendingStreams,
      completed: completedStreams,
      active: activeStreams,
    };
  };

  if (!connected) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-neutral-500 hover:bg-neutral-500 px-3">
          <div className="flex flex-row gap-3 items-center">
            <InfoCircledIcon className="h-4 w-4 text-neutral-100" />

            <span
              className={
                "font-matter " +
                (streamRate > 0
                  ? "text-green-400"
                  : streamRate < 0
                  ? "text-red-400"
                  : "")
              }
            >
              {isLoading || !connected ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                displayStreamRate(streamRate)
              )}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your current stream rate</DialogTitle>
          <DialogDescription>
            This is the current rate at which you are streaming and being
            streamed APT. This rate is calculated by adding up all of the
            streams you are receiving and subtracting all of the streams you are
            sending.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
